class Vue {
    constructor(options) {
        this.$options = options;
        this.$watchEvent = {};
        if (typeof options.beforeCreate === 'function') {
            options.beforeCreate.bind(this)();
        }
        // data
        this.$data = options.data;
        // data劫持
        this.proxyData();
        this.observe();
        if (typeof options.created === 'function') {
            options.created.bind(this)();
        }
        if (typeof options.beforeMount === 'function') {
            options.beforeMount.bind(this)();
        }
        this.$el = document.querySelector(options.el);
        // 模版解析
        this.compile(this.$el)
        if (typeof options.mounted === 'function') {
            options.mounted.bind(this)();
        }
    }
    // 1. 给Vue大对象赋属性，来自于data中
    // 2. data中的属性值和Vue大对象的属性保持双向（劫持）
    proxyData() {
        for (let key in this.$data) {
            Object.defineProperty(this, key, {
                get() {
                    return this.$data[key];
                },
                set(value) {
                    this.$data[key] = value;
                }
            })
        }
    }
    // 触发data中的数据发生变化来执行watch中的update
    observe() {
        for (let key in this.$data) {
            let value = this.$data[key];
            let that = this;
            Object.defineProperty(this.$data, key, {
                get() {
                    return value;
                },
                set(val) {
                    value = val;
                    if (that.$watchEvent[key]) {
                        that.$watchEvent[key].forEach(item => {
                            item.update()
                        })
                    }
                }
            })
        }
    }
    // 编译
    compile(node) {
        node.childNodes.forEach((item) => {
            // 元素节点
            if (item.nodeType === 1) {
                // 判断元素节点是否绑定了@clcik
                if (item.hasAttribute('@click')) {
                    // @click后绑定的属性值 例：btn
                    let vmkey = item.getAttribute('@click').trim()
                    item.addEventListener('click', (event) => {
                        this.eventFn = this.$options.methods[vmkey].bind(this);
                        this.eventFn(event);
                    })
                }

                // 判断元素中是否添加来v-model
                if (item.hasAttribute('v-model')) {
                    let vmkey = item.getAttribute('v-model').trim();
                    if (this.hasOwnProperty(vmkey)) {
                        item.value = this[vmkey]
                    }
                    item.addEventListener('input', (event) => {
                        this[vmkey] = item.value;
                    })
                }

                if (item.childNodes.length > 0) {
                    this.compile(item)
                }

            }
            // 这是文本节点，如果有{{}}就替换成数据
            if (item.nodeType === 3) {
                // 正则匹配{{}}
                let reg = /\{\{(.*?)\}\}/g;
                let text = item.textContent;
                // 给节点赋值
                item.textContent = text.replace(reg, (_match, vmkey) => {
                    vmkey = vmkey.trim();

                    if (this.hasOwnProperty(vmkey)) {
                        // 用$watchEvent关联dom中的视图
                        let watch = new Watch(this, vmkey, item, 'textContent');
                        if (this.$watchEvent[vmkey]) {
                            this.$watchEvent[vmkey].push(watch);
                        } else {
                            this.$watchEvent[vmkey] = [];
                            this.$watchEvent[vmkey].push(watch);
                        }
                    }

                    return this.$data[vmkey]
                })
            }
        });
    }
}

class Watch {
    constructor(vm, key, node, attr) {
        // 对象
        this.vm = vm;
        // 属性名称
        this.key = key;
        // 节点
        this.node = node;
        // 改变文本节点内容的字符串
        this.attr = attr;
    }
    // 执行改变（update）操作
    update() {
        this.node[this.attr] = this.vm[this.key];
    }

}