import p5 from 'p5.js'

// TODO
// Move animation into action
// Show action command
// Show poop amount
// Show engery goal amount

let GROUND = 150 + 25
let MAX_POOP = 2
let FOOD_GOAL = 5
let COMMAND_LENGTH_IN_MS = 1000

class Egg {
  constructor() {
    this.poops = []
    this.food = {
      x: random(10, 290),
      y: GROUND
    }
    this.state = {
      x: 150,
      y: 150,
      width: 70,
      height: 90,
      internalPoopCount: 0,
      foodEaten: 0,
      dead: false,
      hatched: false,
    }
  }

  draw() {
    this.poops.forEach(poop => {
      textSize(poop.size)
      text('💩', poop.x, poop.y)
    })

    let {x, y, width, height, dead, hatched} = this.state
    if (hatched) {
      fill('blue')
      ellipse(x, y, width, height + random(-10, 10))
    } else if (dead) {
      fill('brown')
      ellipse(x, y, width + random(-10, 10), height)
    } else {
      let actionName = this.action ? this.action.name : ''
      textSize(20)
      text(actionName, 20, 20)
      fill('white')
      if (actionName === 'EAT') {
        ellipse(x, y, width, height + random(-10, 10))
      } else if (actionName === 'POOP') {
        ellipse(x, y, width, height + height * this.action.percentComplete())
      } else {
        ellipse(x, y, width, height)
      }
    }

    if (this.food) {
      fill('yellow')
      ellipse(this.food.x, this.food.y, 10)
    }
  }

  update() {
    if (!this.action && this.nextAction) {
      if (this.state.dead || this.state.hatched) return

      this.action = this.createAction(this.nextAction)
      this.nextAction = null
    }

    if (this.action) {
      this.action = this.runAction(this.action)
    }
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  createAction(name) {
    let startedAt = Date.now()
    let start = this.deepCopy(this.state)
    let end = this.deepCopy(this.state)
    let onComplete = () => {}

    if (name === 'LEFT') {
      end.x -= 60
    } else if (name === 'RIGHT') {
      end.x += 60
    } else if (name === 'EAT') {
      end.internalPoopCount++
      end.foodEaten++
      onComplete = () => {
        while(this.whereIsTheFood() === 'under') this.food.x = random(10, 290)
        if (end.foodEaten >= FOOD_GOAL) {
          this.nextAction = 'HATCH'
        } else if (end.internalPoopCount > MAX_POOP) {
          this.nextAction = 'DEATH'
        }
      }
    } else if (name === 'DEATH') {
      end.dead = true
    } else if (name === 'POOP') {
      end.internalPoopCount = 0
      this.poops.push({
        x: this.state.x,
        y: GROUND + random(0, 10),
        size: random(10, 20)
      })
    } else if (name === 'HATCH') {
      end.hatched = true
    } else {
      throw new Error(`UNKOWN ACTION ${action}`)
    }

    return {
      startedAt,
      start,
      end,
      name,
      onComplete,
      length: COMMAND_LENGTH_IN_MS,
      percentComplete: () => {
        return (Date.now() - startedAt) / COMMAND_LENGTH_IN_MS
      }
    }
  }

  runAction(action) {
    if (action.percentComplete() >= 1) {
      this.state = this.deepCopy(action.end)
      action.onComplete()
      return
    }

    for (let key in action.start) {
      let startValue = action.start[key]
      let endValue = action.end[key]
      if (startValue && endValue && typeof startValue !== typeof endValue) throw new Error('Type mismatch')
      if (startValue === endValue) continue

      let type = typeof startValue
      if (type) {
        let delta = endValue - startValue
        this.state[key] = startValue + delta * action.percentComplete()
      } else if (type === 'boolean') {
        // It's cool, don't set this until the endNothing to do until the end!
      } else {
        throw new Error(`Unhandled type ${typeof startValue} for ${key}:${startValue}`)
      }
    }

    return action
  }

  // API
  // ---
  needsToPoop() {
    return this.state.internalPoopCount >= MAX_POOP
  }

  whereIsTheFood() {
    if (this.food.x < this.state.x - this.state.width / 2) {
      return "left"
    } else if (this.food.x > this.state.x + this.state.width / 2) {
      return "right"
    } else {
      return "under"
    }
  }

  moveLeft() {
    this.nextAction = 'LEFT'
  }

  moveRight() {
    this.nextAction = 'RIGHT'
  }

  eat() {
    if (this.whereIsTheFood() === 'under') {
      this.nextAction = 'EAT'
    } else {
      this.nextAction = 'EAT_NOTHING'
    }
  }

  poop() {
    if (this.state.internalPoopCount > 0) {
      this.nextAction = 'POOP'
    } else {
      this.nextAction = 'GRUNT'
    }
  }
}

// Setup
// -----
let egg
p5.setup = () => {
  createCanvas(300, 300)
  noStroke()
  colorMode(HSL)
  egg = new Egg()

  instructions(egg)
  setInterval(() => instructions(egg), COMMAND_LENGTH_IN_MS * 3)
}

p5.draw = () => {
  // ground
  background('black')
  fill('green')
  rect(0, GROUND, 300, 300)

  // egg
  egg.update()
  egg.draw()
}

let instructions = () => {}

export default (yourInstructions) => {
  instructions = yourInstructions
}
