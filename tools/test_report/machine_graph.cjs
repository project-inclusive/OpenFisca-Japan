// Load the pure state model through the installed TypeScript compiler; no app or test bodies.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const fromDashboard = createRequire(
  path.resolve(__dirname, '../../dashboard/package.json')
);
const ts = fromDashboard('typescript');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  module._compile(
    result.outputText +
      (filename.endsWith('/questionDefinition.ts')
        ? '\nmodule.exports.definitions = questionDefinitions;'
        : ''),
    filename
  );
};
const {
  questionStateMachine: machine,
} = require('../../dashboard/src/state/questionState.ts');
const definitions = require('../../dashboard/src/state/questionDefinition.ts');
const { getAdjacencyMap, toDirectedGraph } = fromDashboard('xstate/graph');
const { getInitialSnapshot } = fromDashboard('xstate');

async function main() {
  const { transitionKey } = await import('./transition_key.mjs');
  const transitions = [];
  function visit(graph) {
    const node = graph.stateNode;
    const all = [...node.transitions.values()].flat().concat(node.always || []);
    for (const transition of all)
      transitions.push({
        id: transitionKey(transition),
        source: node.key,
        event: transition.eventType || 'always',
        target: (transition.target || [node])
          .map((target) => target.key)
          .join(', '),
        guarded: Boolean(transition.guard),
      });
    graph.children.forEach(visit);
  }
  visit(toDirectedGraph(machine));
  const initial = getInitialSnapshot(machine);
  const representatives = {};
  for (const key of definitions.questionKeys) {
    const answer = definitions.definitions[key];
    const type = answer.type;
    let values;
    if (type === 'Boolean') values = [false, true, undefined];
    else if (type === 'PersonNum') values = [0, 1, 2, undefined];
    else if (type === 'Age') values = [0, 17, 18, 64, 65, undefined];
    else if (type === 'AmountOfMoney') values = [0, 1, undefined];
    else if (type === 'Selection')
      values = [
        ...definitions.selectionQuestionDefinitions[key].selections,
        undefined,
      ];
    else if (type === 'MultipleSelection') {
      const selections =
        definitions.multipleSelectionQuestionDefinitions[key].selections;
      values = [[], ...selections.map((value) => [value]), [...selections]];
    } else if (type === 'Address') {
      representatives[key] = [
        { type, prefecure: '東京都', municipality: '新宿区' },
      ];
      continue;
    } else throw new Error(`No representative policy for ${key}: ${type}`);
    representatives[key] = values.map((selection) => ({
      type,
      selection,
      ...(type === 'AmountOfMoney' ? { unit: '万円' } : {}),
    }));
  }
  // One-step adjacency from finite synthetic contexts: vary mode, member, and answer profile.
  // Keep full context in serialization; never collapse guard-relevant answers or histories.
  const sampled = new Map();
  let probes = 0;
  for (const mode of representatives['見積もりモード'].filter(
    (answer) => answer.selection
  )) {
    for (const relationship of ['あなた', '配偶者', '子ども', '親']) {
      for (let profile = 0; profile < 6; profile++) {
        const context = structuredClone(initial.context);
        context.currentMember = { relationship, index: 0 };
        for (const key of definitions.questionKeys) {
          const values = representatives[key];
          const value = values[profile % values.length];
          for (const member of ['あなた', '配偶者', '子ども', '親'])
            context[key][member] = [value, value];
        }
        context['見積もりモード'].あなた[0] = mode;
        for (const key of definitions.questionKeys) {
          // Synthetic history permits a safe back probe; it is not a reachable-path claim.
          context.histories =
            key === '見積もりモード'
              ? []
              : [{ key: '見積もりモード', member: context.currentMember }];
          const seed = machine.resolveState({
            value: key,
            context: structuredClone(context),
          });
          const events = representatives[key]
            .map((value) => ({ type: key, value }))
            .concat([{ type: 'next' }, { type: 'reset' }]);
          if (context.histories.length) events.push({ type: 'back' });
          const adjacency = getAdjacencyMap(machine, {
            fromState: seed,
            events,
            serializeState: (state) =>
              JSON.stringify([state.value, state.context]),
            stopWhen: (state) => state !== seed,
            limit: 100,
          });
          for (const edge of Object.values(
            Object.values(adjacency)[0].transitions
          )) {
            const id = JSON.stringify([
              key,
              relationship,
              edge.event,
              edge.state.value,
              edge.state.context.currentMember,
            ]);
            sampled.set(id, true);
            probes++;
          }
        }
      }
    }
  }
  const fingerprint = crypto.createHash('sha256');
  for (const file of [
    'questionState.ts',
    'questionDefinition.ts',
    'questionState.test.ts',
  ])
    fingerprint.update(
      fs.readFileSync(path.join(__dirname, '../../dashboard/src/state', file))
    );
  process.stdout.write(
    JSON.stringify({
      transitions,
      representatives,
      probes,
      sampled: sampled.size,
      fingerprint: fingerprint.digest('hex'),
    })
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
