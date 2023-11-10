# coding: utf-8

#XMLを出力したい形式の辞書型に変換し、JSONファイルとして出力
#1ファイルのみ対応


from bs4 import BeautifulSoup
import json


#各タグのid、xyの最大値最小値が入った辞書を返す
def get_basic_dict(tag):
  obj_id = tag.get("id")
  xmin = tag.get("xmin")
  ymin = tag.get("ymin")
  xmax = tag.get("xmax")
  ymax = tag.get("ymax")
  return {"id": obj_id, "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax}

#各タグのid、xyの最大値最小値、キャラクターidが入った辞書を返す
def get_character_dict(tag):
  character_dict = get_basic_dict(tag)
  character_dict["characterId"] = tag.get("character")
  return character_dict


#xmlファイルを開く
markup = open("/Volumes/USAGI02/03Programming/00_01漫画_産総研/manga_web_app/01m-JavaScript/02JSON/XMLtoJSON/test用_AisazuNihaIrarenai.xml")

#パース
soup = BeautifulSoup(markup, "xml")

output_dict = {}#出力用の辞書を用意

comic_title = soup.find("book").get("title")#bookタグからtitleを取得
output_dict["title"] = comic_title#出力用の辞書に入れる


character_tag = soup.characters.contents#charactersタグの子要素を取得
character_list = [i for i in character_tag if i != "\n"]#character_tagには改行が含まれているのでリスト内包表記で消す

#キャラクターidとキャラクターの名前の辞書を作成しoutput_dictに代入
characters = []
for i in range(len(character_list)):
  obj_id = character_list[i].get("id")
  name = character_list[i].get("name")
  characters.append({"characterId": obj_id, "name": name})
output_dict["characters"] = characters


page_tag = soup.find_all('page')#soupの中からpageタグを子要素を含めて全て取得

pages = []
for i in range(len(page_tag)):
  page_index = page_tag[i].get("index")
  page_width = page_tag[i].get("width")
  page_height = page_tag[i].get("height")
  page_dict = {"index": page_index, "width": page_width, "height": page_height}
  frame_tag = page_tag[i].find_all('frame')
  text_tag = page_tag[i].find_all('text')
  face_tag = page_tag[i].find_all('face')
  body_tag = page_tag[i].find_all('body')
  
  frame = []
  for i in range(len(frame_tag)):
    frame_dict = get_basic_dict(frame_tag[i])
    frame.append(frame_dict)
  if frame != []:
    page_dict["frame"] = frame
  
  text = []
  for i in range(len(text_tag)):
    text_dict = get_basic_dict(text_tag[i])
    text_dict["dialogue"] = text_tag[i].get_text()
    text.append(text_dict)
  if text != []:
    page_dict["text"] = text
  
  face = []
  for i in range(len(face_tag)):
    face_dict = get_character_dict(face_tag[i])
    face.append(face_dict)
  if face != []:
    page_dict["face"] = face
  
  characterBody = []
  for i in range(len(body_tag)):
    body_dict = get_character_dict(body_tag[i])
    characterBody.append(body_dict)
  if characterBody != []:
    page_dict["characterBody"] = characterBody
  pages.append(page_dict)

output_dict["pages"] = pages

with open('test.json', 'w') as f:
    json.dump(output_dict, f, indent=2, ensure_ascii=False)




