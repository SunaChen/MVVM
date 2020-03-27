//给需要变化的对象添加一个观察者，当变动时调用watcher
class Watcher{  
    constructor(vm,exper,cb){
        this.vm = vm
        this.exper =exper
        this.cb = cb

        //先获取原来的值
        this.value = this.get()

    }
    getValue(vm,expr){ //获取实例上对应的数据
        expr = expr.split('.')
        return  expr.reduce((prev,next) => {
                return prev[next]
            },vm.$data)

    }
    get(){
        Dep.target = this
        let value = this.getValue(this.vm,this.exper)
        Dep.target = null
        return value
    }
    //对外暴露的方法
    update(){
        let newValue = this.getValue(this.vm,this.exper)
        let oldValue = this.value
        if(newValue != oldValue ){
            this.cb(newValue)  //调用对应的watch的callback
        } 
    }
}