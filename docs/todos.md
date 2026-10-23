# 未実装・簡略化の一覧

`openfisca_japan` は複雑な制度を段階的に実装しているため、**一部の条件を簡略化している箇所**や
**まだ対応していないケース**があります。このページはソースコード中の `TODO` コメントを自動抽出し、
「どの制度がどこまで実装されているか」を一覧できるようにしたものです
（生成方法は[開発ドキュメント](./dev_note.md#制度ドキュメントの生成)を参照）。

> **試算結果を利用する際の注意**
> ここに挙がっている制度は、条件によっては実際の給付額・受給可否と異なる結果になることがあります。

<!-- 制度一覧へのリンクは生HTMLのため jekyll-relative-links の書き換え対象外。
     出力先の .html をページ相対で直接指定している。 -->
{% assign items = site.data.todos.items %}
{% assign groups = items | group_by: "category" | sort: "name" %}

全 **{{ items | size }}** 件

<input type="search" id="of-filter" placeholder="制度名・内容で絞り込み（例: 年金、所得）" aria-label="未実装項目の絞り込み">
<p id="of-filter-result" role="status"></p>

{% for group in groups %}
<h2 class="of-category">{{ group.name }}<span class="of-count">{{ group.items | size }}</span></h2>

<table class="of-todo-table">
<thead><tr><th>制度（Variable）</th><th>未実装・簡略化の内容</th><th>ソース</th></tr></thead>
<tbody>
{% for item in group.items %}
<tr class="of-item" data-search="{{ item.variable | append: ' ' | append: item.label | append: ' ' | append: item.text | append: ' ' | append: item.category | append: ' ' | append: item.subcategory | strip_newlines | escape }}">
<td>{% if item.variable %}<a href="variables.html#v-{{ item.variable }}"><code>{{ item.variable }}</code></a>{% if item.label and item.label != item.variable %}<br><small>{{ item.label }}</small>{% endif %}{% else %}<small>（ファイル全体）<br>{{ item.subcategory }}</small>{% endif %}</td>
<td>{{ item.text }}</td>
<td><a href="{{ site.source_base_url }}/{{ item.source }}{% if item.line %}#L{{ item.line }}{% endif %}"><small>{{ item.source | remove: 'openfisca_japan/variables/' }}{% if item.line %}:{{ item.line }}{% endif %}</small></a></td>
</tr>
{% endfor %}
</tbody>
</table>
{% endfor %}

<style>
#of-filter { width: 100%; padding: .6em .8em; font-size: 1rem; box-sizing: border-box; margin-bottom: .5em; }
#of-filter-result { color: #606c71; font-size: .9rem; margin: 0 0 1em; }
.of-category { border-bottom: 1px solid #e9ebec; padding-bottom: .2em; }
.of-count { float: right; font-size: .7em; color: #606c71; font-weight: normal; }
.of-todo-table { display: table; width: 100%; table-layout: fixed; }
.of-todo-table th:nth-child(1), .of-todo-table td:nth-child(1) { width: 26%; }
.of-todo-table th:nth-child(3), .of-todo-table td:nth-child(3) { width: 22%; }
.of-todo-table td { word-break: break-word; vertical-align: top; }
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
      if (hit) { shown += 1; }
    });
    // 見出しと直後のテーブルは、配下にヒットが無ければまとめて隠す
    categories.forEach(function (heading) {
      var table = heading.nextElementSibling;
      while (table && table.tagName !== "TABLE") { table = table.nextElementSibling; }
      var visible = table
        ? table.querySelectorAll(".of-item:not(.of-hidden)").length > 0
        : false;
      heading.classList.toggle("of-hidden", !visible);
      if (table) { table.classList.toggle("of-hidden", !visible); }
    });
    status.textContent = query === "" ? "" : shown + " 件が一致しました";
  }

  box.addEventListener("input", apply);
})();
</script>
