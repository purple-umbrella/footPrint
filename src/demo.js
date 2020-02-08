function Basic(config) {
    this.wrap = config.wrap;
    this.tr = config.tr;
    this.td = config.td;
    this.mine = config.mine;
    this.data = [];
    this.randomList = null;
    this.surplusMine = config.mine;
    this.mineNumDom = document.getElementsByClassName('mineNum')[0];
    this.classColorList = ["one", "two", "three", "four", "five", "six"];
}

Basic.prototype = {
    init() {
        this.createRandom();
        this.createDom();
        this.findMind();
        this.bindEvent();
        this.mineNumDom.innerText = "雷数有:" + this.mine ;
        // console.log(this.data)
    },


    createRandom() {
        //随机数，随机出地雷
        this.wrap.innerHTML = "";
        const len = this.td * this.tr;
        const temp = new Array(len);
        for (let i = 0; i < len; i++) {
            temp[i] = i;
        }
        this.randomList = temp.sort(() => Math.random() - 0.5).slice(0, this.mine);
    },

    createDom() {
        //创建DOM元素，把数据存在data中
        let count = 0;
        let table = document.createElement("table");
        table.cellPadding = 0;
        table.cellSpacing = 0;
        for (let i = 0; i < this.tr; i++) {
            let tr = document.createElement('tr');
            this.data.push([]);
            for (let j = 0; j < this.td; j++) {
                count += 1;
                let td = document.createElement('td');
                td.position = [i, j];
                td.value = 0;
                td.type = this.randomList.includes(count) ? "mine" : "number";
                this.data[i].push(td);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        this.wrap.appendChild(table);
    },


    /**
     * 
     * @param {obj} 接收一个dom元素
     */
    findAround(obj) {//返回雷周围除雷外的方格
        let row = obj.position[0];  //i
        let col = obj.position[1];  //j
        const myArr = [];
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || (i == row && j == col) || this.data[i][j].type == "mine") {
                    continue;
                }
                myArr.push([i, j])
            }
        }
        return myArr;
    },

    findMind() {
        for (let i = 0; i < this.tr; i++) {
            for (let j = 0; j < this.td; j++) {
                if (this.data[i][j].type == "number") {
                    continue;
                }
                let around = this.findAround(this.data[i][j]);
                // console.log(around)
                around.forEach(ele => {
                    this.data[ele[0]][ele[1]].value += 1;
                })

            }
        }
    },

    bindEvent() {
        let findZero = (dom) => { //递归，点击的是0的时候，循环点击外的8个方格。如果方格不是为0的数字，就显示数字，否则就继续以此为中心循环周围的8个方格
            let around = this.findAround(dom);
            around.forEach(ele => {
                let d = this.data[ele[0]][ele[1]];
                if (d.value == 0 && !d.checked) {
                    d.checked = true;
                    d.classList.add("zero");
                    findZero(d);
                } else if (d.value != 0) {
                    d.innerText = d.value;
                    d.classList.add(this.classColorList[d.value])
                }
            })

        }
        this.wrap.onmousedown = e => {
            //左击  和 右击
            if (e.target.nodeName == "TD") {
                let pos = e.target.position;
                let targetDom = this.data[pos[0]][pos[1]];
                if (e.which == 1) { //处理左击  1\点击的是不是0数字 -->  显示数字   2\点击的是0  -->递归点击的八个方格
                    if (targetDom.type == "mine") {  //左击点到了地雷
                        this.gameOver(targetDom);
                        return;
                    }

                    if (targetDom.value == 0) {
                        findZero(targetDom);
                    } else {
                        let num = targetDom.value;
                        e.target.classList.add(this.classColorList[num])
                        e.target.innerText = num;
                    }
                } else if (e.which == 3) {//处理右击     --> 同是是否是雷，是雷就
                    if (targetDom.innerText != "") {
                        return;
                    }
                    if (e.target.classList.contains('flag')) { //点击目标有flag -- 移除flag
                        if (targetDom.type == "mine") {
                            ++this.surplusMine;

                        }
                        e.target.classList.remove('flag');
                        // this.mineNumDom.innerText = this.surplusMine;
                    } else { //1、点击目标没有flag -- 添加flag 
                        e.target.classList.add('flag');
                        if (targetDom.type == "mine") {
                            --this.surplusMine;
                        }
                    }
                    if (this.surplusMine == 0) {
                       this.gameWin();
                    }
                }
            }
        }
        this.wrap.oncontextmenu = () => {
            return false;
        }

        document.getElementsByClassName('reset')[0].onclick = () => {
           document.getElementsByClassName('active')[0].onclick();
        }

        let btnList = Array.from(document.getElementsByClassName('level'));
        let levelList = [
            {
                wrap: document.querySelector('.wrap'),
                tr: 10,
                td: 10,
                mine: 10
            },
            {
                wrap: document.querySelector('.wrap'),
                tr: 17,
                td: 17,
                mine: 50
            },
            {
                wrap: document.querySelector('.wrap'),
                tr: 24,
                td: 24,
                mine: 88
            }
        ];

        btnList.forEach((ele, index) => {
            ele.onclick = function(){
                document.getElementsByClassName('active')[0].classList.remove('active');
                this.classList.add("active");
                new Basic(levelList[index]).init();
            }
        })

    },

    gameOver(dom) {
        //游戏结束后取消点击事件
        this.wrap.onmousedown = () => false;
        dom.classList.add("firstMine");
        for (let i = 0; i < this.tr; i++) {
            for (let j = 0; j < this.td; j++) {
                if (this.data[i][j].type == "mine") {
                    if (this.data[i][j].classList.contains("flag")) {
                        this.data[i][j].classList.remove("flag")
                    }
                    this.data[i][j].classList.add('mine')
                }
            }
        }
        alert("game over")
    },

    gameWin(){
        this.wrap.onmousedown = () => false;
        alert('游戏成功')
    }
}