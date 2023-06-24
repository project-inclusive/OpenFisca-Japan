import { Link } from "react-router-dom";

function Description() {
  return(
    // TODO: GitHubとproj-inclusiveのリンクアイコン追加
    <div className="container">
      <h1 className="mt-3">マイ制度シミュレーター</h1>
      <hr />
      <h4 className="mb-4">
        世帯の情報をもとに、受けられる国の子育て支援手当を簡易的に算出します。
        <br></br>
        実際に受けられる手当及び正確な給付額はお住まいの自治体の窓口にお問い合わせください。
        <br></br>
        入力された情報が第三者へ提供されることはありません。
      </h4>
      <hr />
      <Link
        className="btn btn-primary mb-3"
        to="/calculate"
      >
        はじめる
      </Link>
    </div>
  )
}

export default Description;
