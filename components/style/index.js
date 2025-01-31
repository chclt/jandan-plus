const navItemIcons = [
    { name: '首页', icon: 'Home' },
    { name: '问答', icon: 'Text' },
    { name: '树洞', icon: 'Messages' },
    { name: '随手拍', icon: 'Image' },
    { name: '无聊图', icon: 'Favorites' },
    { name: '妹子图', icon: 'Favorites' },
    { name: '女装', icon: 'Favorites' },
    // { name: 'BBS', icon: 'Hash' },
    {name: '鱼塘', icon: 'Fishpond'},
    { name: '热榜', icon: 'Diary' },
    { name: '大杂烩', icon: 'Hash' },
    { name: '个人中心', icon: 'Person' },
    { name: '带货', icon: 'Cart' },
    { name: '瞎买', icon: 'Hide' },
    { name: '我的吐槽', icon: 'Bubble' },
]

nav_fill_icons();
nav_highlight_current();
nav_obverse();

// 删除页面指示器当前页码的中括号
document.querySelectorAll('.current-comment-page').forEach((el) => { el.innerText = el.innerText.replace(/\[|\]/g, ''); });

// 在页脚插入插件信息
document.querySelector('#footer br:first-of-type').insertAdjacentHTML('beforebegin', ' ·  <a href="https://github.com/chclt/jandan-plus/" target="_blank">Enhanced by 煎煎煎蛋</a>');


function nav_fill_icons() {
    document.querySelectorAll('ul.nav-items a').forEach((el) => {
        if (!el.querySelector('i')) {
            let icon = navItemIcons.find((item) => item.name === el.innerText);
            if (icon) {
                el.insertAdjacentHTML('afterbegin', `<i class="i-${icon.icon}"></i>`);
            }
        }
    });
}

function nav_highlight_current() {
    let current = location.pathname;
    let navItems = document.querySelectorAll('ul.nav-items a');
    navItems.forEach((el) => {
        if (el.getAttribute('href') === current) {
            el.style.fontWeight = '700';
        }
    });
}

function nav_obverse() {
    new MutationObserver(function(mutationList, observer) {
        mutationList.forEach((mutation) => {
            switch (mutation.type) {
            case "childList":
                nav_fill_icons();
                break;
            }
        });
    }).observe(document.querySelector('ul.nav-items'), { 
        childList: true, 
        subtree: true 
    });
}
