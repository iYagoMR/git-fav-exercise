import { GithubUser } from "/js/GithubUser.js"

// This class will contain the logic of data retrieving
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  // Get the api
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  // Save the content in the application
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
  
  // This function will retrieve data from the api and create a row in the table with the user's info
  // The user input will be used as a parameter
  async add(username) {
    try {

      // This variable is true if the user try to add an already added person to their favorite list
      const userExists = this.entries.find(entry => entry.login === username)
      // This will throw an error if the user added already exists
      if(userExists) {
        throw new Error('Usuário já cadastrado')
      }

      // This variable will search for the username input given by the user
      const user = await GithubUser.search(username)
      // If the username input does not exists in the database this error will be thrown
      if(user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      // This will create an array containing the user name and some other info
      this.entries = [user, ...this.entries]
      // The update function will use the array created above to create a row in the table
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  // This function will delete a user from the favorite list using the username as a parameter
  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

// This class will create the HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    // tbody represents the place in the HTML where the rows will be placed at
    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }
  
  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    // This will config the row and fill the elements with data from the choosen user Id
    this.entries.forEach( user => {
      // This variable represents the rows
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      // When the user click on the x in the list, the item will be deleted
      // A question will be prompted, to confirm the decision
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }

      // This will assign the mewly formatted row to the list
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = 
    `
    <td class="user">
        <img src="https://github.com/maykbrito.png" alt="Imagem de maykbrito">
        <a href="https://github.com/maykbrito" target="_blank">
            <p>Mayk Brito</p>
            <span>/maykbrito</span>
        </a>
    </td>
    <td class="repositories">
        76
    </td>
    <td class="followers">
        9589
    </td>
    <td>
        <button class="remove">Remover</button>
    </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })  
  }
}


