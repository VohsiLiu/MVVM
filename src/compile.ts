export {Compile}
export {CompileUtil}

import {Watcher} from "./watcher";

class Compile {
    el;
    vm;

    constructor (el, vm) {
        // 检查el是否是DOM节点，如果不是则获取节点
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if(this.el) {
            //获取文档碎片
            let fragment = this.nodeToFragment(this.el);
            //编译文档碎片
            this.compile(fragment);
            // 把编译好的文档碎片追加到页面中去
            this.el.appendChild(fragment);
        }
    }

    // 判断是否是DOM节点
    isElementNode (node): boolean {
        return node.nodeType === 1;
    }
    // 判断是不是指令
    isDirective (name): boolean {
        return name.includes('v-');
    }

    // 将DOM保存到内存中
    nodeToFragment (el) {
        const fragment = document.createDocumentFragment();
        while (el.firstChild) {
            fragment.appendChild(el.firstChild);
        }
        return fragment;
    }

    compile (fragment) {// 编译文档碎片方法
         // 获取子节点
         const childNodes = fragment.childNodes;
         // 识别节点类型并处理
         [...childNodes].forEach(child => {
             if (this.isElementNode(child)) {
                 // 元素节点处理
                 this.compileElement(child);
             } else {
                 // 文本节点处理
                 this.compileText(child)
             }
             // 如果还有子节点则需要递归调用
             if (child.childNodes && child.childNodes.length) {
                 this.compile(child)
             }
         })
    }

    compileElement (node) { // 编译元素节点
        // 带 v-model 的
        let attrs = node.attributes; // 取出当前节点的属性
        Array.from(attrs).forEach(attr => {
            // 判断属性名字是不是包含 v-
            let attrName = (attr as any).name;
            if(this.isDirective(attrName)) {
                // 取到对应的值，放在节点中
                let exp = (attr as any).value;
                let [, type] = attrName.split('-');
                // node this.vm.$date exp
                CompileUtil[type](node, this.vm, exp);
            }
        });
    }

    // 编译文本节点
    compileText (node) { 
        const content = node.textContent; // 获取文本中的内容
        // 正则匹配{{**}}内容
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(content)) {
            // node this.vm.$date exp
            CompileUtil['text'](node, this.vm, content);
        }
    }
}

const CompileUtil = {
    // 获取实例上对应的数据
    getVal(vm, exp) {
        exp = exp.split('.');
        return exp.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    },
    // 设置实例上对应的数据
    setVal(vm, exp, newVal) {
        exp = exp.split('.');
        return exp.reduce((prev, next, currentIndex) => {
            if (currentIndex === exp.length - 1) {
                return prev[next] = newVal;
            }
            return prev[next];
        }, vm.$data);
    },
    // 获取编译文本后的结果
    getTextVal(vm, exp) {
        return exp.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            return this.getVal(vm, arg[1]);
        });
    },
    //文本处理
    text(node, vm, exp) {
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm, exp);
        exp.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
            new Watcher(vm, arg[1], newValue => {
                // 如果数据变化了，文本节点应该重新获取依赖的数据更新文本中的内容
                updateFn && updateFn(node, newValue);
            });
        });
        updateFn && updateFn(node, value);
    },
    // 输入框处理
    model(node, vm, exp) {
        let updateFn = this.updater['modelUpdater'];
        let value = this.getVal(vm, exp);
        // 添加监控，当数据变化时调用 watch 的回调
        new Watcher(vm, exp, newValue => {
            updateFn && updateFn(node, newValue);
        });
        // 添加输入框事件实现双向绑定
        node.addEventListener('input', e => {
            let newValue = e.target.value;
            this.setVal(vm, exp, newValue);
        });
        // 防止没有的指令解析时报错
        updateFn && updateFn(node, value);
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value;
        },
        // 输入框更新
        modelUpdater(node, value) {
            node.value = value;
        }
    }
};
