# 制度一覧（Variable）

`openfisca_japan` が実装している制度と、その計算に使う項目（Variable）の一覧です。
各項目の `label` / `documentation` / `reference` は **ソースコードから自動抽出**しているため、
実装と内容が乖離しません（生成方法は[開発ドキュメント](./dev_note.md#制度ドキュメントの生成)を参照）。

- **制度**: 給付額・貸付額や対象かどうかなど、見積もり結果として出す値。制度ごとに、その計算項目・入力項目をまとめています
- **計算項目**: `formula` を持ち、他の項目から自動計算される中間的な値
- **入力項目**: `formula` を持たず、利用者が与える必要がある値

<!-- 制度の判定方法は tools/make_docs/make_docs.py の build_variable_entries を参照 -->
{% assign items = site.data.variables.items %}
{% assign institutions = site.data.institutions.items %}
{% assign institution_groups = institutions | group_by: "category" | sort: "name" %}
{% assign common = items | where_exp: "i", "i.institution == nil" %}
{% assign common_calculations = common | where: "role", "計算項目" %}
{% assign common_inputs = common | where: "role", "入力項目" %}
{% assign with_todo = items | where_exp: "i", "i.todos.size > 0" %}

全 **{{ items | size }}** 項目。うち **{{ with_todo | size }}** 項目に未実装・簡略化の注記があります（[一覧](./todos.md)）。

- [制度](#institutions)（{{ institutions | size }} 制度）
- [共通の計算項目](#common-calculations)（{{ common_calculations | size }} 項目）: 所得・税・社会保険料など、複数の制度で使う値
- [共通の入力項目](#common-inputs)（{{ common_inputs | size }} 項目）: 年齢・収入・障害など、世帯や世帯員の基本情報

<input type="search" id="of-filter" placeholder="制度名・ラベル・説明で絞り込み（例: 児童手当、障害）" aria-label="制度の絞り込み">
<p id="of-filter-result" role="status"></p>

<div class="of-group">
<h2 id="institutions" class="of-section">制度<span class="of-count">{{ institutions | size }}</span></h2>

<p class="of-note"><span class="of-tag of-tag-kind">給付</span> <span class="of-tag of-tag-kind">貸付</span> <span class="of-tag of-tag-kind">対象判定</span> は見積もり結果での表示区分です。<span class="of-tag of-tag-hidden">アプリ未掲載</span> はバックエンドに実装済みで、見積もり結果にはまだ表示していない制度です。</p>

{% for group in institution_groups %}
<div class="of-group">
<h3 class="of-category">{{ group.name }}<span class="of-count">{{ group.items | size }}</span></h3>

{% for institution in group.items %}
{% assign members = items | where: "institution", institution.name %}
{% assign outputs = members | where: "role", "制度" %}
{% assign calculations = members | where: "role", "計算項目" %}
{% assign inputs = members | where: "role", "入力項目" %}
<details class="of-inst" id="i-{{ institution.name }}" data-search="{{ institution.name | append: ' ' | append: institution.description | append: ' ' | append: institution.subcategory | strip_newlines | escape }}">
<summary><strong>{{ institution.name }}</strong>{% for kind in institution.kinds %} <span class="of-tag of-tag-kind">{{ kind }}</span>{% endfor %}{% unless institution.in_app %} <span class="of-tag of-tag-hidden">アプリ未掲載</span>{% endunless %}{% if institution.todo_count > 0 %} <span class="of-tag of-tag-todo">未実装 {{ institution.todo_count }}</span>{% endif %}</summary>

{% if institution.description %}<p class="of-desc">{{ institution.description | newline_to_br }}</p>{% endif %}

<div class="of-group">
<h4 class="of-sub">結果<span class="of-count">{{ outputs | size }}</span></h4>
{% for item in outputs %}{% include variable_item.html item=item %}{% endfor %}
</div>

{% if calculations.size > 0 %}
<div class="of-group">
<h4 class="of-sub">計算項目<span class="of-count">{{ calculations | size }}</span></h4>
{% for item in calculations %}{% include variable_item.html item=item %}{% endfor %}
</div>
{% endif %}

{% if inputs.size > 0 %}
<div class="of-group">
<h4 class="of-sub">入力項目<span class="of-count">{{ inputs | size }}</span></h4>
{% for item in inputs %}{% include variable_item.html item=item %}{% endfor %}
</div>
{% endif %}

<p class="of-source">ソース: <a href="{{ site.source_base_url }}/{{ institution.source }}"><code>{{ institution.source }}</code></a></p>
</details>
{% endfor %}
</div>
{% endfor %}
</div>

{% assign sections = "common-calculations,common-inputs" | split: "," %}
{% for section in sections %}
{% if section == "common-calculations" %}{% assign section_items = common_calculations %}{% assign section_title = "共通の計算項目" %}{% else %}{% assign section_items = common_inputs %}{% assign section_title = "共通の入力項目" %}{% endif %}
<div class="of-group">
<h2 id="{{ section }}" class="of-section">{{ section_title }}<span class="of-count">{{ section_items | size }}</span></h2>

{% assign groups = section_items | group_by: "category" | sort: "name" %}
{% for group in groups %}
<div class="of-group">
<h3 class="of-category">{{ group.name }}<span class="of-count">{{ group.items | size }}</span></h3>
{% assign sorted = group.items | sort: "subcategory" %}
{% for item in sorted %}{% include variable_item.html item=item %}{% endfor %}
</div>
{% endfor %}
</div>
{% endfor %}

<style>
#of-filter { width: 100%; padding: .6em .8em; font-size: 1rem; box-sizing: border-box; margin-bottom: .5em; }
#of-filter-result { color: #606c71; font-size: .9rem; margin: 0 0 1em; }
.of-section { border-bottom: 2px solid #159957; padding-bottom: .2em; margin-top: 1.6em; }
.of-category { border-bottom: 1px solid #e9ebec; padding-bottom: .2em; }
.of-note { color: #606c71; font-size: .85rem; }
.of-inst { border: 1px solid #e9ebec; border-radius: .3em; padding: .4em .8em; margin: .5em 0; }
.of-inst > summary { cursor: pointer; }
.of-inst[open] { border-color: #159957; }
.of-desc { margin: .6em 0; }
.of-sub { font-size: .9rem; color: #606c71; margin: .8em 0 .2em; }
.of-sub .of-count { float: none; margin-left: .5em; }
.of-source { font-size: .8rem; color: #606c71; margin: .8em 0 .2em; }
.of-count { float: right; font-size: .7em; color: #606c71; font-weight: normal; }
.of-item { border-left: 3px solid #e9ebec; padding: .3em 0 .3em .8em; margin: .35em 0; }
.of-item > summary { cursor: pointer; }
.of-item[open] { border-left-color: #159957; }
.of-item dl { margin: .6em 0 .2em; }
.of-item dt { font-weight: bold; font-size: .85rem; color: #606c71; }
.of-item dd { margin: 0 0 .5em; }
.of-tag { font-size: .7rem; padding: .1em .5em; border-radius: 1em; background: #e9ebec; color: #1e6bb8; white-space: nowrap; }
.of-tag-kind { background: #d8f0e3; color: #0f6b3d; }
.of-tag-hidden { background: #fce8b2; color: #7a5c00; }
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
  var institutions = Array.prototype.slice.call(document.querySelectorAll(".of-inst"));
  // 内側のグループから順に判定できるよう、文書の後ろから並べる
  var groups = Array.prototype.slice.call(document.querySelectorAll(".of-group")).reverse();

  function matches(element, query) {
    return element.dataset.search.toLowerCase().indexOf(query) !== -1;
  }

  function apply() {
    var query = box.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (item) {
      var institution = item.closest(".of-inst");
      // 制度名で絞り込んだ場合は、その制度の項目をすべて表示する
      var hit = query === "" || matches(item, query) || (institution !== null && matches(institution, query));
      item.classList.toggle("of-hidden", !hit);
      // 絞り込み中はヒットした項目を開いて中身を見えるようにする
      item.open = hit && query !== "";
      if (hit) { shown += 1; }
    });
    institutions.forEach(function (institution) {
      var visible = institution.querySelector(".of-item:not(.of-hidden)") !== null;
      institution.classList.toggle("of-hidden", !visible);
      institution.open = visible && query !== "";
    });
    // 見出しは配下にヒットが無ければ隠す
    groups.forEach(function (group) {
      group.classList.toggle("of-hidden", group.querySelector(".of-item:not(.of-hidden)") === null);
    });
    status.textContent = query === "" ? "" : shown + " 件が一致しました";
  }

  // 未実装一覧などから #v-項目名 で飛んできた場合、閉じた制度の中にあっても見えるように開く
  function reveal() {
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) { return; }
    for (var node = target; node; node = node.parentElement) {
      if (node.tagName === "DETAILS") { node.open = true; }
    }
    target.scrollIntoView();
  }

  box.addEventListener("input", apply);
  window.addEventListener("hashchange", reveal);
  reveal();
})();
</script>
