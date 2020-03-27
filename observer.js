class Observer{
    constructor(data){
        this.observer(data)
    }
    observer(data){
        //要对这个data数据将原来的的属性改成set和get形式
        //判断data是否为对象
        if(!data || typeof data !== 'object'){
            return
        }
        //要将数据一一劫持，先获取到data的key和value
        Object.keys(data).forEach(key => {
            //劫持
            this.defineReactive(data,key,data[key])
            //深度递归劫持
            this.observer(data[key])
        })

    }

    defineReactive(obj,key,value){
        let that = this
        let dep = new Dep() //每个变化的数据，都会对应一个数组，这个数组是存放所有更新的操作
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){ //取值时调用
              Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue){ //设置新值时调用
                if(newValue != value){
                    that.observer(newValue)
                    value = newValue
                    dep.notify() //通知所有数据更新了
                }

            }
        })


    }

}

//发布订阅
class Dep{
    constructor(){
        //订阅的数组
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher => watcher.update())
    }
}