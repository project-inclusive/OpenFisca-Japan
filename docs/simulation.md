# シミュレーション

## 概要

OpenFiscaはWeb APIだけでなく、ローカル環境での大規模高速計算が可能なPython APIも備えている。  

OpenFisca公式HPの参考ページ: https://openfisca.org/doc/simulate/index.html

## 環境構築

PyPIから OpenFisca-Japan をインストールする。

```
pip install openfisca-japan
```

Python 3.9以上が必要。  
使用する主要ライブラリはOpenFisca-Core, Numpy。

## 実行方法

OpenFiscaリポジトリの `simulation`フォルダ内のサンプルコードを参照。

Windowsでサンプルコード実行時に、 [UnicodeDecodeError: 'cp932' codec can't decode byte...] が出た場合は、下記の記事を参考にWindowsの設定変更により対処する。  
[WindowsでUnicodeDecodeError: 'cp932' codec can't decode byte... が出たときの対処方法](https://qiita.com/misohagi/items/e26c589506a69261fe04)

ただしその対処により、コマンドプロンプト上で日本語が文字化けする場合があるため、IDEの使用を推奨。