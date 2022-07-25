import {Compile} from "./compile";
import {Observer} from "./observer";

export {MVVM}

class MVVM {
    $el;
    $data;

    constructor (options, frag) {
        // 先将可用的东西挂载在实例上，并获取模版实例
        this.$data = options.data;
        if (frag) {
            this.$el = frag;
        } else {
            this.$el = document.querySelector(options.el);
        }
        // 数据劫持，就是把对象的所有属性添加 set 和 get 方法
        new Observer(this.$data);

        // 将数据代理到实例上
        this.proxyData(this.$data);

        // 用数据和元素进行编译
        new Compile(this.$el, this);
    }

    // 数据代理
    proxyData (data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get () {
                    return data[key];
                },
                set (newVal) {
                    data[key] = newVal;
                }
            });
        });
    }
}

(window as any).MVVM = MVVM;