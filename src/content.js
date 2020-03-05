


let page_url = {
    href: '',
    authority: '',
    all_url: [],
    id: '',
    current: 0,
    count: 0,
}
let page_data = []
let _talk_count=0
let filter_con = ['1024','感谢分享','谢谢分享','多谢分享','支持发帖','学习了','学习学习','不错','不错哦']
let filter_con_count = 0
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
    let input =document.querySelectorAll('.pages input')[0]
    let p = input?input.value.split('/') :[1,1]
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
    if (pageIndex >= max || pageIndex === 10) {
        console.log('✅✅✅✅✅✅结束')
        console.log(page_data)
        htmlLoadingEnd()
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
    let jibie = html.match(/(?<=555555\"\>).*?(?=\<\/font\>)/ig)
    //第一页
    if (pageIndex === 0) {
        // name.shift()
        con.shift()
        time.shift()
        jibie.shift()
    }
    let one = con.map((x, ind) => {
        let li = {}
        li.name = name[ind]
        li.con = con[ind]
        li.time = time[ind]
        li.jibie = jibie[ind]
        
        li.index = ind + 1
        return li
    })
    // 过滤
    one = one.filter(o=>{
        let con = o.con.trim()
        if(!filter_con.includes(con)) {
            return o
        }
        else{
            filter_con_count++
        }
    })
    page_data.push(one)
    htmlEdit(one)
    console.log(`加入第${pageIndex}页`)
    getData(urlArray, max, pageIndex + 1)
}

// 关闭广告
function closeAd() {
    document.querySelectorAll('.tips').remove()
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
                    <font size="7" color="white"><b style="font-weight:300;">回帖
                        <span class="_talk_count">0</span>
                        
                    </b></font>
                </a>
            </div>

            <div class="h guide" colspan="2">
                    已过滤:
                    <span class="filter_con_count">0</span>
            </div>
            <div class="talk_ul"></div>
            <div class="loading">加载中...</div>
        </div>
    `)
}
function htmlLoadingEnd (){
    document.querySelector('.loading').innerHTML = '加载完毕！'
}

// 重新组合
function htmlEdit(one) {
    let li_html = ''
    one.map(p => {
        li_html += `
                <div class="talk_li">
                    <div class="pic ${p.jibie[0]}">${p.jibie[0]}</div>
                    <div class="text">
                        <div class="name">
                            <div>
                                ${p.name}
                                <span class="time">${p.time}</span>
                            </div>
                            <div class="lou" >
                                <a href="javascript:$('._talk').animate({ scrollTop: 0 }, 500);">${_talk_count}楼</a>
                            </div>
                        </div>
                        <div>
                            ${p.con}
                        </div>
                    </div>
                </div>
            `
        _talk_count++
    })
    document.querySelector('.talk_ul').insertAdjacentHTML('beforeend',li_html)
    document.querySelector('._talk_count').innerHTML = _talk_count
    document.querySelector('.filter_con_count').innerHTML = filter_con_count
 
}

// 设置css
function setCss (){
    let t = document.querySelectorAll('td.tac img')
    for (let i = 0; i < t.length; i++) {
        t[i].style.width = '85px'
    }
    let t2 = document.querySelectorAll('tr.tr1.do_not_catch th')
    for (let i = 0; i < t2.length; i++) {
        t2[i].setAttribute('width','85px')
        t2[i].setAttribute('rowspan','1')
        
    }
    // let t3 = document.querySelectorAll('tr.tr1 th')
    // for (let i = 0; i < t.length; i++) {
    //     t3[i].remove()
    // }
}

// 开始运行
async function start() {
    setCss()
    htmlLoading()

    // closeAd()
    await pageUrl()
    console.log(page_url);
    getData(page_url.all_url, page_url.count, 0)
    // 

}
start()