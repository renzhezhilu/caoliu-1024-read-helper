/*!
 * Vue.js v2.6.11
 * (c) 2014-2019 Evan You
 * Released under the MIT License.
 */



let page_url = {
    href: '',
    authority: '',
    all_url: [],
    id: '',
    current: 0,
    count: 0,
}
let page_data = []
////////////////////////////
// 获取页面信息
async function pageUrl() {
    let href = window.location.href
    let isFirst = href.includes('htm_data')
    if (isFirst) {
        page_url.id = href.split('/').reverse()[0].split('.')[0]
        page_url.authority = href.split('/htm_data')[0]
    } else {
        page_url.id = href.match(/(?<=tid\=).*?(?=\&page)/ig)[0]
        page_url.authority = href.split('/read.php')[0]
    }
    // let p = $('.pages input').eq(0).val().split('/')
    let p = document.querySelectorAll('.pages input')[0].value.split('/')
    let first_page = await fetch(`${page_url.authority}/read.php?tid=${page_url.id}&page=1`).then(x => x.text())
    first_page = first_page.match(/(?<=href\=\").*?(?=\"\>)/ig)[1]
    let all_url = []
    all_url.push(page_url.authority + '/' + first_page)
    for (let i = 2; i < +p[1] + 1; i++) {
        all_url.push(`${page_url.authority}/read.php?tid=${page_url.id}&page=${i}`)
    }
    page_url.all_url = all_url
    page_url.href = href
    page_url.current = p[0] - 0
    page_url.count = p[1] - 0
}

// 转编码
async function toUtf8(blob) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = function(e) {
            let text = reader.result
            resolve(text)
        }
        reader.readAsText(blob, 'GBK')
    })
}

// 获取回复数据
async function getData(urlArray, max, pageIndex = 0) {
    //最后一页
    if (pageIndex >= max) {
        console.log('✅✅✅✅✅✅结束')
        console.log(page_data)
        htmlEdit()
        return
    }

    let html = await fetch(urlArray[pageIndex])
        .then(res => res.blob())
        .then(async (blob) => {
            let text = await toUtf8(blob)
            return text
        })

    let name = html.match(/(?<=rowspan\=\"2\"\>\<b\>).*?(?=\<\/b\>)/ig)
    if (!name) name = html.match(/(?<=class\=\"r_two\"\> \<b\>).*?(?=\<\/b\>)/ig)
    let con = html.match(/(?<=tpc_content do_not_catch\"\>).*?(?=\<\/div\>)/ig)
    if (!con) con = html.match(/(?<=tpc_content\" \>).*?(?=\<\/div\>)/ig)
    // (?<=A).*?(?=B)
    let time = html.match(/(?<=Posted\:).*?(?=\|)/ig)
    //第一页
    if (pageIndex === 0) {
        // name.shift()
        con.shift()
        time.shift()
    }
    let one = con.map((x, ind) => {
        let li = {}
        li.name = name[ind]
        li.con = con[ind]
        li.time = time[ind]
        li.index = ind + 1
        return li
    })
    page_data.push(one)
    console.log(`加入第${pageIndex}页`)
    getData(urlArray, max, pageIndex + 1)
}

// 关闭广告
function closeAd() {
    setTimeout(() => {
        // let txt = document.querySelectorAll('.tpc_content.do_not_catch')[0].innerHTML
        // console.log(txt)

        // 
        let t = document.querySelectorAll('.tips')
        for (let i = 0; i < t.length; i++) {
            // t[i].style.width='0'
            // t[i].style.height='0'
            t[i].style.opacity = '0'
        }
        let t2 = document.querySelectorAll('.sptable_do_not_remove')
        for (let i = 0; i < t.length; i++) {
            t2[i].style.display = 'none'
        }
        // 

        // document.querySelectorAll('.tpc_content.do_not_catch')[0].innerHTML = txt
    }, 3000)

}

// 初始化-加载中
function htmlLoading() {

    document.querySelector('body').insertAdjacentHTML('beforeend', `
        <div class="_talk" id="_talk">
            <div class="banner" id="_talk_top" style="padding-left:5px;">
                <a href="../../../">
                    <font size="7" color="white"><b style="font-weight:300;">回帖(451)</b></font>
                </a>
            </div>

            <div class="h guide" colspan="2">
                <a href="../../../profile.php">01</a>
                | <a href="../../../message.php">02</a>
                | <a href="../../../search.php">03</a>
                | <a href="../../../message.php">02</a>
            </div>
            <div style="">加载中...</div>
        </div>
    `)
}

// 重新组合
function htmlEdit() {
    // let body = document.querySelector('body').innerHTML
    // const talk = document.createElement('div')
    // talk.className = '_talk'
    let talk_html = ''
    page_data.map(item => {
        let li_html = ''
        item.map(p => {
            li_html += `
                <div class="talk_li">
                    <div class="pic">${p.name[0]}</div>
                    <div class="text">
                        <div class="name">
                            ${p.name}
                            <span class="time">${p.time}</span>
                        </div>
                        <div>
                            ${p.con}
                        </div>
                    </div>
                </div>
            `
        })
        talk_html += li_html
    })
    console.log(talk_html);
    

    document.querySelector('body').insertAdjacentHTML('beforeend', `
        <div class="_talk" id="_talk">
        
            <div class="banner" id="_talk_top" style="padding-left:5px;">
                <a href="../../../">
                    <font size="7" color="white"><b style="font-weight:300;">回帖(451)</b></font>
                </a>
            </div>

            <div class="h guide" colspan="2">
                <a href="../../../profile.php">01</a>
                | <a href="../../../message.php">02</a>
                | <a href="../../../search.php">03</a>
                | <a href="../../../message.php">02</a>
            </div>

            ${talk_html}

        </div>
    `)
}

// 

// 开始运行
async function start() {
    htmlLoading()

    // closeAd()
    await pageUrl()
    console.log(page_url);
    getData(page_url.all_url, page_url.count, 0)
    // 

}
start()