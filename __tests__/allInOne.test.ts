import {MVVM} from "../src/MVVM";


let app = document.createElement('div');
app.id = 'app';
let childNode = document.createElement('input');
childNode.setAttribute('v-model', 'message');
let text = document.createTextNode("{{message}}");
app.appendChild(childNode).appendChild(text);

let vm = new MVVM({
    data: {
        el: '#app',
        message: 'hello world!'
    }
}, app);

describe('test', () => {

    test('mvvm初始化', () => {
        expect(vm.$data.message).toBe(childNode.value);
    })

    test('修改数据模型，期望视图发生改变', () => {
        vm.$data.message = "hello mvvm";
        expect(vm.$data.message).toBe(childNode.value);
    });

    test('修改视图，期望数据模型发生改变', () => {
        childNode.value = "hello mvvm";
        childNode.dispatchEvent(new window.Event('input'));
        expect(vm.$data.message).toBe(childNode.value);
    });
})

