import { useContext } from "react"
import { ShowAlertMessageContext } from "../../../../contexts/ShowAlertMessageContext"

export const ErrorMessage = ({condition}: {condition: boolean}) => {
  const showAlertMessage = useContext(ShowAlertMessageContext);

  if (!condition) {
    return null
  }

  // HACK: spanタグのinvalidクラスをバリデーションエラーの存在チェックに使用
  return (
    <>
      <span
        className="invalid"
      ></span>
      {showAlertMessage &&
        <div
          style={showAlertMessage ? {} : { display: "none"}}
          className="alert alert-danger"
        >
          入力必須項目です
        </div>
      }
    </>
  )
}
