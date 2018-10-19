class Component{
  constructor(props={}){
    let self=this;
    this.props=props;
    this.render = this.render || function() {};
    // !props.isChild && store.watch("state change",()=>self.render())
  } 
}