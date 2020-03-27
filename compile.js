// 编译模板
class Compile{
    constructor(el,vm){
        this.el = this.isElement(el)?el:document.querySelector(el)
        this.vm = vm

        if(this.el){
            //获取到el,进行编译
            //1.先把真实的DOM移入到内存中fragment
            let fragment = this.node2Fragment(this.el)
            //2.编译：提取想要元素的元素节点v-modle和文本节点{{}}
            this.compile(fragment)
            //3.将元素插入到页面中
            this.el.appendChild(fragment)
        }
    }

    //判断是否为元素
    isElement(node){
        return node.nodeType === 1
    }
    //判断是否有v-
    isDirective(name){
        return name.includes('v-')
    }
    //核心方法
    compileElement(node){
        //获取属性 
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            //判断是否有包含v-
            let attrName = attr.name
            
            if(this.isDirective(attrName)){
                //取到对应的值放到节点中
                let expr = attr.value 
                let [,type] = attrName.split('-')
                CompileUtil[type](node,this.vm,expr)
            }
            
        })

    }
    compileText(node){
        //带{{}}
        let expr = node.textContent
        let reg = /\{\{([^]+)\}\}/g
        if(reg.test(expr)){
            CompileUtil['text'](node,this.vm,expr)

        }

    }
    compile(fragment){
        let childNodes = fragment.childNodes
        // 需要递归
        Array.from(childNodes).forEach(node => {
            if (this.isElement(node)) { 
                //是元素对象需要深入的检查
                this.compileElement(node)
                this.compile(node) 
                
            } else {
                this.compileText(node)

            }
        })
        

    }
    node2Fragment(el){  //需要将el中的内容全部放入到内存中

        //文档碎片
        let fragment = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment //内存中的节点

    }

}

CompileUtil = {
    getVal(vm,expr){ //获取实例上对应的数据
        expr = expr.split('.')
        return  expr.reduce((prev,next) => {
                return prev[next]
            },vm.$data)

    },
    getTextVal(vm,expr){ //获取编译文本后的结果
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) => {
            return this.getVal(vm,arguments[1])
         })

    },
    text(node,vm,expr){  //文本处理
        let updaterFn = this.updater['textUpdater']
        let value = this.getTextVal(vm,expr)
         expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) => {
             new Watcher(vm,arguments[1],(newValue)=>{
                 //如果数据变化了，文本节点需要重新获取依赖的数据更新文本的数据
                updaterFn && updaterFn(node,this.getTextVal(vm,expr))
             })
        
         })

        updaterFn && updaterFn(node,value)
    
    },
    setValue(vm,expr,value){
        expr = expr.split('.')
        return expr.reduce((prev,next,currentIndex) => {
            if(currentIndex === expr.length - 1){
                return prev[next] = value
            }
            return prev[next]
        },vm.$data)

    },
    mode(node,vm,expr){ //输入框处理
      let updaterFn = this.updater['modeUpdater']
        //添加一个监控，数据变化了，应该调用这个watch的callback
        new Watcher(vm,expr,(newValue)=>{
            //当值变化后会调用cb，将新的值传递过来
            updaterFn && updaterFn(node,this.getVal(vm,expr))

        })
        node.addEventListener('input',(e) => {
            let newValue = e.target.value;
            this.setValue(vm,expr,newValue)

        })
      
      updaterFn && updaterFn(node,this.getVal(vm,expr))
    },
    updater:{
        textUpdater(node,value){
            node.textContent = value
        },
        modeUpdater(node,value){
            node.value = value
        }
    }
}