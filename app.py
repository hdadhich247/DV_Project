#############
###IMPORTS###
#############

import os
import time
import json
import re
import random
import numpy as np
from flask import Flask, request, redirect, url_for, render_template, jsonify, session, abort
from werkzeug.utils import secure_filename
from sklearn.metrics.pairwise import cosine_similarity
##########
###INIT###
##########

DATA_FOLDER = './static/data/'
with open(DATA_FOLDER+"doc_ids.json") as f:
	doc_ids = json.load(f)

with open(DATA_FOLDER+"doc_topic.json") as f:
	doc_topic = json.load(f)

for i in doc_topic:
	doc_topic[i] = np.array(doc_topic[i]).astype(np.float32)

with open(DATA_FOLDER+"word_ids.json") as f:
	word_ids = json.load(f)

with open(DATA_FOLDER+"word_topic.json") as f:
	word_topic = json.load(f)

topic_words_list = []
topic_words_json = {}
for i in range(30):
	temp_l = []
	with open(DATA_FOLDER+"topic"+str(i)+".csv", "r") as f:
		data = f.read()
	data = data.split("\n")[1:]
	topic_words_json['t'+str(i)] = {}
	for j in data:
		t = j.split(",")
		topic_words_json['t'+str(i)][t[0]] = float(t[1])
		temp_l.append([t[0],float(t[1])])
	topic_words_list.append(temp_l)

f = open("static/data/topic_x_word.json", "w")
f.write(str(topic_words_json))
f.close()



colors = [[206, 230, 174], [155, 230, 225], [206, 224, 163], [208, 178, 225], [187, 209, 234], [253, 236, 216], [207, 215, 207], [218, 155, 183], [204, 221, 185], [207, 163, 227], [254, 254, 169], [235, 180, 199], [189, 217, 230], [204, 227, 233], [197, 175, 170], [196, 194, 207], [208, 250, 180], [157, 218, 169], [156, 238, 254], [158, 157, 228], [210, 169, 220], [155, 233, 220], [243, 211, 222], [248, 245, 172], [215, 177, 197], [241, 192, 240], [178, 159, 199], [253, 180, 201], [214, 231, 175], [186, 214, 248]]

# f = open("static/data/colors1.json","w")
# f.write(str({"colors":colors}))
# f.close()

colors_str = ["rgb("+str(i[0])+","+str(i[1])+","+str(i[2])+")" for i in colors]
print(colors_str)

app = Flask(__name__)

@app.route("/get_linegraph_data")
def get_linegraph_data():
	did = request.args.get("did")
	with open(DATA_FOLDER+"doc"+did+"_linegraph.json", "r") as f:
		data = json.load(f)
	for i in range(len(data["data"])):
		idx = int(data["data"][i]["id"][1:])
		clr = "rgb("+str(colors[idx][0])+','+str(colors[idx][1])+','+str(colors[idx][2])+")"
		data["data"][i]["color"] = clr

	return jsonify(data)

@app.route("/docsearch")
def docsearch():
	words = []
	asdf = request.args
	t_array = [0 for i in range(30)]
	for i in asdf:
		w = request.args.get(i)
		if w in word_ids:
			wid = word_ids[w]
			if str(wid) in word_topic:
				topics = word_topic[str(wid)]
				print(topics)
				for tix in topics:
					t = topics[tix]
					t_array[int(tix)] += float(t)
				words.append(t_array)

	print(t_array)

	topic_score_array = {"children":[]}
	for i in range(30):
		if t_array[i]!=0:
			temp_j = {"topic":"topic"+str(i)}
			temp_j['score'] = t_array[i]
			temp_j['color'] = "rgb("+str(colors[i][0])+','+str(colors[i][1])+','+str(colors[i][2])+")"
			topic_score_array["children"].append(temp_j)

	scores = []
	for i in doc_topic:
		score = cosine_similarity([doc_topic[i]],[t_array])[0][0]
		if score:
			scores.append([doc_ids[i],doc_topic[i].tolist()])
	scores = sorted(scores, key=lambda x:x[1], reverse=True)

	# doc_topic_string = "Document,topics,length"
	# for i in scores:
	# 	t = doc_ids[i[0]]
	# 	for j in range(30):
	# 		doc_topic_string += "\n"+t+",topic"+str(j)+","+str(i[1][j])
	# with open(DATA_FOLDER+"Extension.csv","w") as f:
	# 	f.write(doc_topic_string)

	return jsonify({"scores":scores, "topic_scores":topic_score_array})

@app.route("/get_topic_scores")
def get_doc():
	docid = request.args.get('docid')
	return jsonify({"topicscores":doc_topic["doc"+str(docid)].tolist()})

@app.route("/get_colors")
def get_colors():
	return jsonify({"colors":colors})

@app.route("/get_topic_words_json")
def get_topic_words_json():
	return jsonify({"topic_words_json": topic_words_json})

@app.route("/get_word_ranks")
def get_word_ranks():
	# words = ['heaven', 'sun']
	# print(len(topic_words_list))
	words = []
	asdf = request.args
	print(asdf)
	for i in asdf:
		words.append(request.args.get(i))
	print(words)
	if not words:
		print("NO words Found!")
		topic_lens = []
		for i in range(30):
			topic_lens.append({'name':"topic"+str(i), 'len':len(topic_words_list[i])})
		return jsonify({'topic_lens':topic_lens, "ranks":[]})

	ranks = []
	for word in words:
		trank = []
		for i in range(len(topic_words_list)):
			tlen = len(topic_words_list[i])
			sorted_list = sorted(topic_words_list[i], key=lambda x:x[1], reverse=True)
			tr = 999
			for ix in range(tlen):
				if word.lower() == sorted_list[ix][0].lower():
					tr = ix+1
					break
			trank.append(tr)
		ranks.append(trank)
	npr = np.array(ranks)
	tnpr = npr.T
	snpr = np.min(tnpr,axis=1)
	ixs = np.argsort(snpr)
	topic_lens = []
	for i in ixs:
		topic_lens.append({'name':"topic"+str(i), 'len':len(topic_words_list[i])})
	new_ranks = tnpr[ixs].T.tolist()
	# print(new_ranks.tolist())
	return jsonify({'topic_lens':topic_lens, "ranks":new_ranks})

@app.route("/")
def home():
	print("START******")
	return render_template('./index.html', colors_str=colors_str)

if __name__ == '__main__':
	app.run(host='0.0.0.0',port=8000, debug=False)