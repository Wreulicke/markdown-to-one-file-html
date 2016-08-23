Promiseを連結する

タイトル通りです。

皆さん、Promiseをお使いでしょうか？
そんなあなたは、以下のようなコードをよく見ることと思われます。

```js
var hogePromise=fetch(url)
hogePromise
.then(foo)
.then(bar)
.then(baz)
.catch(hogehoge)
```

ではPromiseを連結していきましょう。

# その前に。きっかけ

きっかけは[こいつ](https://github.com/fgnass/domino/blob/master/lib/HTMLParser.js#L11)

```js
var pushAll=Function.prototype.apply.bind(Array.prototype.push)
var array=[]
var items=[1,2,3]
pushAll(array, items); // => array=[1,2,3]
```

何が起きたのか。

1. Function.prototype.apply.bind(Array.prototype.push)でapplyのcontextのthisにArray.prototype.pushがbindされた。
2. ここで返却されるのはapply自体が返却される。apply対象がArray.prototype.pushになった。
3. いつもどおりapplyを呼び出すイメージでpushAll(array,items)

結果的にArray.prototype.push.apply(array, items)と同じコードになる。

今回はこれを使ってPromiseを連結する。

# 連結イメージ

連結、といっても正確に言うとmapのchainするようなイメージになる。

```js
var result=1
result=a(1)
result=b(2)
result=c(3)
```

こんな形の処理のイメージ。ただPromiseをベースに処理をするので正確に一番上の例（を簡単にしたい）になる。

では最終的なイメージはどうなるか。
第一引数にPromiseかそれ以外のデータを渡す。
第二引数以降にPromiseもしくはその他の生データを返却する関数を渡す。
```js
flow(
  '{"url":"string"}',
  JSON.parse,
  (data)=>{return fetch(data.url)},
  ()=>{console.log(arguments)}
)
```

# 実装

実装はこちら。

構成としては
* Promiseでラップするだけの関数と
* 初めの説明に似たpipe
* reduceのみ
となっております。

```js
function promisify(result){
  if(result instanceof Promise)return result;
  return Promise.resolve(result)
}

const pipe=Function.prototype.call.bind(Promise.prototype.then);

function flow(item, ...funcs){
  return funcs.reduce(pipe, promisify(item));
}
```

pipeはどういう動きをするか。
第一引数に与えられたPromiseに対してthenメソッドのinvokeを行い、
第二引数に与えられた関数を渡します。

ではreduceの動きを思い出しましょう。
第一引数に与えられた関数を関数が生えてる配列の要素の分行います。
第二引数に初期値が与えられているので配列の要素の分だけ、になります。

reduceの関数に入ってくるのはここではresult, funcになります。
resultは最初初期値が与えられているのでpromisifyの値、要するに何が何でもPromiseが入ってきます。

funcは名前の通り関数ですね。
Promiseのthenに適用されます。

pipeをわかりやすい形で書くとこうなります

```js
const pipe=(result, func) => {return result.then(func)}
```

これだけです。（わかりにくいコード書くよりこっちの方がいいというツッコミもあるかと思います。）
ただthenしているだけですね。戻りもPromiseになっていることがわかりやすいですね。

予期せぬ引数が入ってきて死ぬ可能性があります。
できるだけ引数を絞った関数を書いたほうがいいので
その点にだけはご注意ください。

# 最後に
Function.prototype.call/applyにbindしたかっただけです。ごめんなさい。


