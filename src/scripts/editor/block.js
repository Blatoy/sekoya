class Block {
  constructor(name, type, position = {x: 0, y: 0}, properties = {}, children = []) {
    this.name = name;
    this.type = type;
    this.position = position;
    this.properties = properties;
    this.children = children;
  }

  render(ctx) {
    
  }
}
