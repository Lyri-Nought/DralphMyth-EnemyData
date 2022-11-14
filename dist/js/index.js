/* 全ページで使用する共通の宣言など */
const mainArea=document.getElementById("main")//書き換えるHTMLのエリア
const htmlUrl=window.location.href//index.htmlのパス
function getQuery(name){//クエリ文字列(URLパラメータ)を取得する関数
    name=name.replace(/[\[\]]/g,"\\$&");
    const regex=new RegExp("[?&]"+name+"(=([^&#]*)|&|#|$)"),
        results=regex.exec(htmlUrl)
    if(!results){return null}
    if(!results[2]){return ''}
    return decodeURIComponent(results[2].replace(/\+/g," "))
}
const page=getQuery("page")//開いているページの種類
const index=getQuery("index")//開いているページの項目

function convertNull(value,alt="？"){//値がnullなら"？"として返す関数
    if(value===null){
        return alt
    }else{
        return value
    }
}



/* ページごとに表示するコンテンツを変更するための関数 */

function updateHeader(_page=page){//ヘッダーを変更する関数
    let result
    switch (_page){
        case null://一覧ページのヘッダー
            result=`
            <div id="headerContent">
                <input type="text" id="searchText" placeholder="タグ検索">
                <div id="headerButtonArea">
                    <button id="headerButton">新規作成</button>
                </div>
            </div>
            `//新規作成ボタンは後でimplementCreateButton()で動作処理を適用する仕様
            break
        case "view"://閲覧ページのヘッダー
            result=`
            <div id="headerContent">
                <div id="headerButtonArea">
                    <button id="headerButton" onclick="location.href='./index.html?page=edit&index=${index}'">編集</button>
                    <button id="headerButton" onclick="location.href='./index.html'">一覧</button>
                </div>
            </div id="headerContent">
            `
            $("#styleSwitch").attr("href","./css/view.css" )
            break
        case "edit"://編集ページのヘッダー
            result=`
            <div id="headerContent">
                <div id="headerButtonArea">
                    <button id="headerButton">閲覧</button>
                    <button id="saveButton">保存</button>
                </div>
            </div>
            `
            $(document).on("click","#headerButton",function(){//閲覧ボタンに処理を適用する
                saveJson()//jsonファイルを上書き更新する
                location.href=`./index.html?page=view&index=${index}`
            })
            $(document).on("click","#saveButton",function(){//保存ボタンに処理を適用する
                alert("保存しました")
                saveJson()//jsonファイルを上書き更新する
            })
            $("#styleSwitch").attr("href","./css/edit.css" )
            break
    }
    document.getElementById("header").innerHTML=result
}

function updateMain(_page=page){//メインを変更する関数
//TODO メインを変更する処理
}

/* 一覧ページを表示中に使う関数 */
function createEnemyElement(index,name,level,tag){//表示する敵データの要素を作成する関数
    return `
        <div class="data">
            <div class="name">${convertNull(name)}</div>
            <div class="level">Lv${convertNull(level,"?")}</div>
            <div class="tag">${convertNull(tag,"")}</div>
            <div class="button">
                <button class="editButton" onclick="location.href='./index.html?page=view&index=${index}'" >閲覧</button>
                <button class="editButton" onclick="location.href='./index.html?page=edit&index=${index}'" >編集</button>
            </div>
        </div>
    `
}
function getEnemyDataByTag(data,tagName){//指定されたタグに合致する敵データを取得する関数
    let result=""
    $.each(data.enemy,function(index,value){
        if(tagName===value.tag){
            result+=createEnemyElement(index,value.name,value.level,value.tag)
        }
    })
    return result
}
function getAllEnemyTag(data){//敵データの全タグ種を取得する関数
    let enemyTagList=new Array
    $.each(data.enemy,function(index,value){
        if(!enemyTagList.includes(value.tag)){
            enemyTagList.push(value.tag)
        }
    })
    return enemyTagList
}
function showEnemyData(data,filter=""){//表示する敵データを作成する関数
    let result=""
    if(filter===""){//フィルターなしのとき
        let allEnemyTag=getAllEnemyTag(data)
        for(let i in allEnemyTag){//タグ毎にデータをまとめて出力する
            result+=getEnemyDataByTag(data,allEnemyTag[i])
        }
    }else{//フィルターありのとき
        result+=getEnemyDataByTag(data,filter)//指定されたタグを持つデータのみを出力する
    }
    mainArea.innerHTML=result//表の中身を変更する
}

/* 閲覧ページを表示中に使う関数 */

/* 編集ページを表示中に使う関数 */
function saveJson(){//更新されたjsonファイルを保存する関数
//TODO jsonファイルを上書き更新する
}

/* ヘッダー関連の処理 */
function updateSearchText(data){////検索するための処理を検索ボックスに適用する関数
    $("#searchText").on("input",function(){
        const filter=$("#searchText").val()//検索ボックスに入力された値
        showEnemyData(data,filter)//敵データにフィルターをかけて表示する
    })
}

function implementCreateButton(index){//新規作成ボタンに処理を適用する関数
    $(document).on("click","#headerButton",function(){//新規作成ボタンに処理を適用する
        location.href=`./index.html?page=edit&index=${index}`
    })
}

/* ここから実際の処理 */
updateHeader()//ページごとにヘッダーを更新する
$(function(){
    $.ajax({
        url:"./data.json",//jsonファイルの場所
        dataType:"json",// json形式でデータを取得
    })
    .done(function(data){
        switch(page){
            case null://一覧ページの際の処理
                updateSearchText(data)//検索するための処理を検索ボックスに適用する
                showEnemyData(data)//全部のデータを表示する
                implementCreateButton(data.enemy.length)//新規作成ボタンに処理を適用する
                break
            default:
                break
        }
    })
})