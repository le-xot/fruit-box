export enum FruitsEnum {
  Apple = 'Яблоки',
  AppleAndOrange = 'Яблоки и Апельсины',
  Orange = 'Апельсины',
}

export enum FruitEnum {
  Apple = 'Яблоко',
  Orange = 'Апельсин',
}

export interface BoxState {
  label: FruitsEnum
  isOpen: boolean
  content: FruitsEnum | null
  prediction: FruitsEnum | null
  took: FruitEnum | null
}

export class YouLostError extends Error {
  constructor() {
    super('You lost')
  }
}

function getRandomPermutation(): { [key: string]: FruitsEnum } {
  const perms = [
    {
      [FruitsEnum.Apple]: FruitsEnum.Orange,
      [FruitsEnum.AppleAndOrange]: FruitsEnum.Apple,
      [FruitsEnum.Orange]: FruitsEnum.AppleAndOrange,
    },
    {
      [FruitsEnum.Apple]: FruitsEnum.AppleAndOrange,
      [FruitsEnum.AppleAndOrange]: FruitsEnum.Orange,
      [FruitsEnum.Orange]: FruitsEnum.Apple,
    },
  ]
  return perms[Math.floor(Math.random() * perms.length)]
}

export class FruitGame {
  boxes: BoxState[]
  firstOpenedIndex: number | null = null

  constructor() {
    const permutation = getRandomPermutation()
    this.boxes = [
      { label: FruitsEnum.Apple, isOpen: false, content: permutation[FruitsEnum.Apple], prediction: null, took: null },
      { label: FruitsEnum.AppleAndOrange, isOpen: false, content: permutation[FruitsEnum.AppleAndOrange], prediction: null, took: null },
      { label: FruitsEnum.Orange, isOpen: false, content: permutation[FruitsEnum.Orange], prediction: null, took: null },
    ]
  }

  static fromJSON(json: any): FruitGame {
    const game = new FruitGame()
    game.firstOpenedIndex = json.firstOpenedIndex
    game.boxes = json.boxes
    return game
  }

  openBox(index: number): boolean {
    if (!this.boxes[index].isOpen) {
      if (this.firstOpenedIndex === null) {
        this.firstOpenedIndex = index
        this.boxes[index].isOpen = true
        this.boxes[index].took = Math.random() < 0.5 ? FruitEnum.Apple : FruitEnum.Orange
      }
    }
    return this.boxes.every(b => b.isOpen)
  }

  openRemainingBoxes(): boolean {
    const unopened = this.boxes.filter(b => !b.isOpen)
    if (unopened.some(b => b.prediction === null)) throw new Error('Укажите предсказания для всех закрытых коробок.')
    this.boxes.forEach((b) => {
      if (!b.isOpen) {
        b.isOpen = true
        if (b.prediction !== b.content) throw new YouLostError()
      }
    })
    return true
  }

  setPrediction(index: number, prediction: FruitsEnum) {
    this.boxes[index].prediction = prediction
  }

  checkWin(): boolean {
    return this.boxes.every((b, i) => {
      if (i === this.firstOpenedIndex) return true
      return b.prediction === b.content
    })
  }
}
