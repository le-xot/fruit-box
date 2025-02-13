export enum FruitsEnum {
  // eslint-disable-next-line no-unused-vars
  Apple = 'Яблоки',
  // eslint-disable-next-line no-unused-vars
  AppleAndOrange = 'Яблоки и Апельсины',
  // eslint-disable-next-line no-unused-vars
  Orange = 'Апельсины',
}

export enum FruitEnum {
  // eslint-disable-next-line no-unused-vars
  Apple = 'Яблоко',
  // eslint-disable-next-line no-unused-vars
  Orange = 'Апельсин',
}

export interface BoxState {
  label: FruitsEnum
  isOpen: boolean
  content: FruitsEnum | null
  prediction: FruitsEnum | null
  took: FruitEnum | null
}

function getRandomPermutation(): { Apple: FruitsEnum, AppleAndOrange: FruitsEnum, Orange: FruitsEnum } {
  const perms = [
    {
      Apple: FruitsEnum.Orange,
      AppleAndOrange: FruitsEnum.Apple,
      Orange: FruitsEnum.AppleAndOrange,
    },
    {
      Apple: FruitsEnum.AppleAndOrange,
      AppleAndOrange: FruitsEnum.Orange,
      Orange: FruitsEnum.Apple,
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
      {
        label: FruitsEnum.Apple,
        isOpen: false,
        content: permutation.Apple,
        prediction: null,
        took: null,
      },
      {
        label: FruitsEnum.AppleAndOrange,
        isOpen: false,
        content: permutation.AppleAndOrange,
        prediction: null,
        took: null,
      },
      {
        label: FruitsEnum.Orange,
        isOpen: false,
        content: permutation.Orange,
        prediction: null,
        took: null,
      },
    ]
  }

  static fromJSON(json: any): FruitGame {
    const game = new FruitGame()
    game.firstOpenedIndex = json.firstOpenedIndex
    game.boxes = json.boxes
    return game
  }

  openBox(index: number): void {
    if (!this.boxes[index].isOpen) {
      if (this.firstOpenedIndex === null) {
        this.firstOpenedIndex = index
        this.boxes[index].isOpen = true
        this.boxes[index].took = Math.random() < 0.5 ? FruitEnum.Apple : FruitEnum.Orange
      }
    }
  }

  openRemainingBoxes(): void {
    const unopened = this.boxes.filter(b => !b.isOpen)
    if (unopened.some(b => b.prediction === null)) {
      throw new Error('Укажите предсказания для всех закрытых коробок.')
    }
    this.boxes.forEach(b => {
      if (!b.isOpen) {
        b.isOpen = true
      }
    })
  }

  setPrediction(index: number, prediction: FruitsEnum): void {
    this.boxes[index].prediction = prediction
  }

  checkGameStatus(): 'won' | 'lost' {
    for (let i = 0; i < this.boxes.length; i++) {
      if (i === this.firstOpenedIndex) continue
      if (this.boxes[i].prediction !== this.boxes[i].content) {
        return 'lost'
      }
    }
    return 'won'
  }
}
