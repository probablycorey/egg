# egg

`https://services.tttiny.com/fetchLib/probablycorey/egg`

# eggample

```js
let commands = (egg) => {
  if (egg.needsToPoop()) {
    egg.poop()
    return
  } else {
    let direction = egg.whereIsTheFood()
    if (direction == 'left') {
      egg.moveLeft()
    } else if (direction == 'right') {
      egg.moveRight()
    } else {
      egg.eat()
    }
  }
}
```
