// 观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法
class Watcher {
    constructor(vm, exp, callback) {
        this.vm = vm;
        this.exp = exp;
        this.callback = callback;
        this.preValue = this.getInitVal(); //获取初始值
    }
    getInitVal() {
        Dep.target = this;
        let value = CompileUtil.getVal(this.vm, this.exp);
        Dep.target = null;
        return value;
    }
    update() {
        // 更新时检查当前值是否有变化 有变化则更新数值
        let newValue = CompileUtil.getVal(this.vm, this.exp);
        if (newValue !== this.oldValue) { // 如果修改后的新旧值不等就执行回调
            this.callback(newValue);
        }
    }
}
