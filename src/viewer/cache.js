function LRUCache(capacity){
    this.map={};
    this.head={next:null};
    this.tail={prev:this.head};
    this.head.next=this.tail;
    this.capacity=capacity;
    this.length=0;
}

LRUCache.prototype={
    get:function(key){
        var item=this.map[key];
        if(!item)return null;
        item.unlink();
        item.linkTo(this.head);
        return item.data;
    },
    put:function(key,data){
        var item=this.map[key];
        if(!item && (this.length===this.capacity)){
            item=this.tail.prev;
            delete this.map[item.key];
        }
        if(item){
            item.unlink();
            this.length--;
        }
        this.map[key]=new CacheItem(key,data,this.head);
        this.length++;
    }
};

function CacheItem(key,data,prev){
    this.key=key;
    this.data=data;
    this.linkTo(prev);
}

CacheItem.prototype={
    linkTo:function(prev){
        var next=prev.next;
        prev.next=this;
        this.prev=prev;
        this.next=next;
        next.prev=this;
    },
    unlink:function(){
        this.prev.next=this.next;
        this.next.prev=this.prev;
        this.prev=null;
        this.next=null;
    }
};
