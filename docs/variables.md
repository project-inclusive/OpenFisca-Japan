# 制度一覧（Variable）

`openfisca_japan` が実装している制度・計算項目（Variable）の一覧です。
各項目の `label` / `documentation` / `reference` は **ソースコードから自動抽出**しているため、
実装と内容が乖離しません（生成方法は[開発ドキュメント](./dev_note.md#制度ドキュメントの生成)を参照）。

- **計算値**: `formula` を持ち、他の項目から自動計算される項目
- **入力値**: `formula` を持たず、利用者が与える必要がある項目

{% assign items = site.data.variables.items %}
{% assign computed = items | where: "computed", true %}
{% assign groups = items | group_by: "category" | sort: "name" %}

{% assign with_todo = items | where_exp: "i", "i.todos.size > 0" %}
全 **{{ items | size }}** 項目（計算値 {{ computed | size }} / 入力値 {{ items | size | minus: computed.size }}）
うち **{{ with_todo | size }}** 項目に未実装・簡略化の注記があります（[一覧](./todos.md)）。

<input type="search" id="of-filter" placeholder="制度名・ラベル・説明で絞り込み（例: 児童手当、障害）" aria-label="制度の絞り込み">
<p id="of-filter-result" role="status"></p>

{% for group in groups %}
<h2 id="cat-{{ forloop.index }}" class="of-category">{{ group.name }}<span class="of-count">{{ group.items | size }}</span></h2>

{% assign sorted = group.items | sort: "subcategory" %}
{% for item in sorted %}
<details class="of-item" id="v-{{ item.name }}" data-search="{{ item.name | append: ' ' | append: item.label | append: ' ' | append: item.documentation | append: ' ' | append: item.category | append: ' ' | append: item.subcategory | strip_newlines | escape }}">
<summary><code>{{ item.name }}</code>{% if item.label and item.label != item.name %} — {{ item.label }}{% endif %} <span class="of-tag">{{ item.entity }}</span>{% unless item.computed %} <span class="of-tag of-tag-input">入力値</span>{% endunless %}{% if item.todos.size > 0 %} <span class="of-tag of-tag-todo">未実装 {{ item.todos.size }}</span>{% endif %}</summary>

<dl>
{% if item.documentation %}<dt>説明</dt><dd>{{ item.documentation | newline_to_br }}</dd>{% endif %}
<dt>値の型</dt><dd><code>{{ item.value_type }}</code>{% if item.unit %}（単位: {{ item.unit }}）{% endif %}{% if item.default_value != nil %} / 既定値 <code>{{ item.default_value }}</code>{% endif %}</dd>
{% if item.possible_values.size > 0 %}<dt>選択肢</dt><dd>{% for value in item.possible_values %}<code>{{ value }}</code>{% unless forloop.last %} / {% endunless %}{% endfor %}</dd>{% endif %}
<dt>適用単位</dt><dd>{{ item.definition_period }}</dd>
{% if item.formula_start_dates.size > 1 %}<dt>計算式の適用開始日</dt><dd>{% for date in item.formula_start_dates %}<code>{{ date }}</code>{% unless forloop.last %} / {% endunless %}{% endfor %}</dd>{% endif %}
{% if item.todos.size > 0 %}<dt>未実装・簡略化</dt><dd><ul class="of-todo">{% for todo in item.todos %}<li>{{ todo.text }}{% if todo.line %} <a href="{{ site.source_base_url }}/{{ item.source }}#L{{ todo.line }}" class="of-line">L{{ todo.line }}</a>{% endif %}</li>{% endfor %}</ul></dd>{% endif %}
{% if item.references.size > 0 %}<dt>参照</dt><dd>{% for reference in item.references %}<a href="{{ reference }}">{{ reference }}</a>{% unless forloop.last %}<br>{% endunless %}{% endfor %}</dd>{% endif %}
<dt>ソース</dt><dd><a href="{{ site.source_base_url }}/{{ item.source }}"><code>{{ item.source }}</code></a></dd>
</dl>
</details>
{% endfor %}
{% endfor %}

<style>
#of-filter { width: 100%; padding: .6em .8em; font-size: 1rem; box-sizing: border-box; margin-bottom: .5em; }
#of-filter-result { color: #606c71; font-size: .9rem; margin: 0 0 1em; }
.of-category { border-bottom: 1px solid #e9ebec; padding-bottom: .2em; }
.of-count { float: right; font-size: .7em; color: #606c71; font-weight: normal; }
.of-item { border-left: 3px solid #e9ebec; padding: .3em 0 .3em .8em; margin: .35em 0; }
.of-item > summary { cursor: pointer; }
.of-item[open] { border-left-color: #159957; }
.of-item dl { margin: .6em 0 .2em; }
.of-item dt { font-weight: bold; font-size: .85rem; color: #606c71; }
.of-item dd { margin: 0 0 .5em; }
.of-tag { font-size: .7rem; padding: .1em .5em; border-radius: 1em; background: #e9ebec; color: #1e6bb8; white-space: nowrap; }
.of-tag-input { background: #fce8b2; color: #7a5c00; }
.of-tag-todo { background: #ffdce0; color: #86181d; }
.of-todo { margin: 0; padding-left: 1.2em; }
.of-todo li { margin: .2em 0; }
.of-line { font-size: .8rem; color: #606c71; }
.of-hidden { display: none; }
</style>

<script>
(function () {
  var box = document.getElementById("of-filter");
  var status = document.getElementById("of-filter-result");
  var items = Array.prototype.slice.call(document.querySelectorAll(".of-item"));
  var categories = Array.prototype.slice.call(document.querySelectorAll(".of-category"));

  function apply() {
    var query = box.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (item) {
      var hit = query === "" || item.dataset.search.toLowerCase().indexOf(query) !== -1;
      item.classList.toggle("of-hidden", !hit);
      // 絞り込み中はヒットした項目を開いて中身を見えるようにする
      item.open = hit && query !== "";
      if (hit) { shown += 1; }
    });
    // 見出しは配下にヒットが無ければ隠す
    categories.forEach(function (heading) {
      var visible = false;
      var node = heading.nextElementSibling;
      while (node && !node.classList.contains("of-category")) {
        if (node.classList.contains("of-item") && !node.classList.contains("of-hidden")) {
          visible = true;
          break;
        }
        node = node.nextElementSibling;
      }
      heading.classList.toggle("of-hidden", !visible);
    });
    status.textContent = query === "" ? "" : shown + " 件が一致しました";
  }

  box.addEventListener("input", apply);
})();
</script>
