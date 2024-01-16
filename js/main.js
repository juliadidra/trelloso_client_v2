import User from './users.js';
import Token from './token.js';

var is_password_showing = false;

const body = document.getElementsByTagName("body")[0];

const tituloLogin = document.getElementsByClassName("titulo-login")[0];
const formLogin = document.getElementById("form-login");
const formCreateUser = document.getElementById("form-create-user");
const forms = document.getElementById("forms");

const div_msg_cadastro = document.getElementsByClassName("mensagem-cadastro")[0];
const botao_cadastro = document.getElementsByClassName("botao-cadastro")[0];
const container_home = document.getElementById("container-home");
const boards_container = document.getElementById("boards-container");

const board_content = document.getElementById("board-content");
const board_content_name = document.getElementById("board-content-name");
const board_content_container = document.getElementById("board-content-container");

const show_all_button = Object.values(document.getElementsByClassName("show-all"));
const show_favoritos_button = document.getElementById("show-favoritos");
const button_perfil = document.getElementById("button-perfil")

const token = Token.getToken();

if(token) {
  forms.style.display = "none";
  tituloLogin.style.display = "none";
  container_home.classList.add("active");
  body.style.background = "#0f172a";
  body.style.color = "#f9fafb"
  getBoards();
  getUserProps();
}

show_all_button.forEach(botao => {
  botao.addEventListener("click", () => {

    getBoards();
  });
})

show_favoritos_button.addEventListener("click", () => {
  getBoards("favoritos")
})

async function getUserPropsPerfil() {
  var img_perfil_atual = document.getElementById("img_perfil_atual")
  var nome_perfil = document.getElementById("nome_perfil")
  var username_perfil = document.getElementById("username_perfil")
  const user = await User.me();

  img_perfil_atual.src = user.avatar_url;
  nome_perfil.innerHTML = user.name;
  username_perfil.innerHTML = `<p>username: ${user.username}</p>`;
}

button_perfil.addEventListener("click", () => {
  const container_editar_perfil = document.getElementById("container-editar-perfil");
  const fechar_editar_perfil = document.getElementById("fechar-editar-perfil");
  const form_edit_perfil = document.getElementById("form-edit-perfil");
  

  getUserPropsPerfil()

  form_edit_perfil.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form_edit_perfil)
    const nome = formData.get("name");
    const avatar = formData.get("avatar");
    const senha = formData.get("password");

    await User.updatePerfil(nome, avatar, senha);
    window.location.reload();
  })

  container_editar_perfil.classList.add("active")
  fechar_editar_perfil.addEventListener('click', () => {
    container_editar_perfil.classList.remove("active"); 
  })
});


const show_hide_password = Object.values(document.getElementsByClassName("show-hide-password"));
const passwords = Object.values(document.getElementsByClassName("passwords"));

show_hide_password.forEach(botao => {
  botao.addEventListener("click", () => {
    if(is_password_showing) {
      is_password_showing = false;
      passwords.forEach(input => {
        input.type = "password"
      });
    }
    else {
      is_password_showing = true;
      passwords.forEach(input => {
        input.type = "text"
      });

    }
  })
})

const sair = document.getElementById("sair");
const botao_criar_board = document.getElementById("botao-criar-board")
botao_criar_board.addEventListener('click', createBoard)

sair.addEventListener('click', () =>{
  Token.removeToken();
  window.location.reload();
});

async function showBoard(id) {
  const board = await User.getBoard(id);
  boards_container.style.display = "none";
  board_content.style.display = "flex";

  board_content_name.innerText = board.name;

  var lists = [];
  for(let list of board.lists) {
    const listData = await User.getList(list.id);
    lists.push(listData);
  }

  board_content_container.innerHTML = `
    ${
      lists.map(list => {
        return (
          `<div class="board-lists">
            <div class="list-header">
              <h4>${list.name}</h4>

              <button class="delete-list">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
  
            ${
              list.cards.map(card => {
                return (
                  `
                    <div class="board-list-card" data-cardid="${card.id}">
                      <div>
                        <div class="card-tags">
                          ${
                            card.tags.map(tag => {
                              return `
                                <div class="tag" data-cardid="${card.id}" data-color="${tag.color}"></div>
                              `
                            }).join("")
                          }
                        </div>
                        ${card.name}
                        <button class="delete-card">
                          <span style="opacity: 0; position: absolute;">${card.id}</span>
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      <div>
                          <div>
                            <i class="fa-regular fa-comment"></i>
                            <span>${card.cardcomments_count}</span>
                          </div>
                          <div>
                            <i class="fa-solid fa-users"></i>
                            <span>${card.cardmembers_count}</span>
                          </div>
                      </div>
                    </div>
                  `
                )
              }).join("")
            }
  
            <button class="add-card">
              <i class="fa-solid fa-plus"></i>
              Adicionar Cartão
            </button>
          </div>`
        )
      }).join("")
    }
  `

  board_content_container.innerHTML += `
    <button id="add-list">
      <i class="fa-solid fa-plus"></i>
      Adicionar Lista
    </button>
  `;

  const add_list_button = document.getElementById("add-list");

  add_list_button.addEventListener("click", () => createList(id))

  const add_card_button = Object.values(document.getElementsByClassName("add-card"));
  add_card_button.forEach((botao, index) => {
    botao.addEventListener("click", () => {
      var currentList = board.lists[index];
      console.log(currentList)
      createCard(currentList.id);
    })
  });

  const delete_list = Object.values(document.getElementsByClassName("delete-list"));
  delete_list.forEach((botao, index) => {
    botao.addEventListener("click", async () => {
      const currentList = board.lists[index];

      await User.deleteList(currentList.id)
    })
  });

  const delete_card = Object.values(document.getElementsByClassName("delete-card"));
  delete_card.forEach(botao => {
    botao.addEventListener("click", async e => {
      const cardId = parseInt(e.target.textContent);

      await User.deleteCard(cardId);
      window.location.reload();
    })
  });

  const cards = Object.values(document.getElementsByClassName("board-list-card"));
  const tags = Object.values(document.getElementsByClassName("tag"));
  cards.forEach(card => {
    const card_id = parseInt(card.getAttribute("data-cardid"));

    const currentTags = tags.filter(tag => {
      const cardId = tag.getAttribute("data-cardid");
      return card_id == cardId
    });

    currentTags.forEach(tag => {
      const card_color = tag.getAttribute("data-color");
      tag.style.backgroundColor = card_color
    })

    card.addEventListener("click", () => {
      openCard(card_id);
    })
  })
}

async function openCard(cardId) {
  const cardData = await User.getCard(cardId);

  const container_card = document.getElementById("container-card");
  const card_form = document.getElementById("card-form");

  container_card.classList.add("active");

  const members = await User.getAll();
  const membersIds = cardData.cardmembers.map(m => m.member_id);
  var membersData = [];
  membersIds.forEach(id => {
    membersData.push(members.find(m => m.id == id))
  });

  console.log(membersData)

  card_form.innerHTML += `
    <div>
      <h3>${cardData.name}</h3>
      ${cardData.date ? `<p>${new Date(cardData.date).toLocaleString("pt-br")}</p>` : ""}

      <div>
        <h4>Comentários</h4>
        ${
          cardData.cardcomments.map(item => {
            const member = members.find(m => m.id == item.member_id);
            return `
              <div>
                ${ member.avatar_url ? (
                  `<img src="${member.avatar_url}" alt="${member.username}">`               
                ) : (
                  `<div class="user-null">
                    <i class="fa-regular fa-user"></i>
                  </div>`
                )}
                
                ${item.comment}
              </div>
            `
          }).join("")
        }
        
        <form class="create-comment">
          <input type="text" placeholder="Adicione um comentário" name="comment"></input>
          <button type="submit" class="create-comment-button">
            <i class="fa-solid fa-plus"></i>
          </button>
        </form>
      </div>
    </div>

    <div class="container-members">
      <h3>Adicionar Membro</h3>
      <form class="card-member">
        <input type="text" name="username" placeholder="Insira o username">
        <button type="submit" class="create-comment-button">
          <i class="fa-solid fa-plus"></i>
        </button>
      </form>

      <h3>Membros</h3>

      <ul class="list-members">
        ${
          membersData.map(member => {
            return `
              <li>
                ${ member.avatar_url ? (
                  `<img src="${member.avatar_url}" alt="${member.username}">`               
                ) : (
                  `<div class="user-null">
                    <i class="fa-regular fa-user"></i>
                  </div>`
                )}
                <span>${member.name}</span>
              </li>
            `
          }).join("")
        }
      </ul>
    </div>
  `

  const create_comment_forms = Object.values(document.getElementsByClassName("create-comment"));
  create_comment_forms.forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault()
      const comment = new FormData(form).get("comment");
      
      await User.createCardComment(cardId, comment);
      window.location.reload();
    })
  })
  
  const card_member_forms = Object.values(document.getElementsByClassName("card-member"));
  card_member_forms.forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get("username");

      await User.createCardMember(cardId, username);
      window.location.reload();
    })
  })
}

async function createList(boardId) {
  const container_criar_lista = document.getElementById("container-criar-lista");
  const fechar_create_list = document.getElementById("fechar-create-list");
  const nome_create_list = document.getElementById("nome-create-list");
  const botao_concluido_create_list = document.getElementById("botao-concluido-create-list");

  fechar_create_list.addEventListener("click", () => {
    container_criar_lista.classList.remove("active");
  })
  
  container_criar_lista.classList.add("active");
  
  botao_concluido_create_list.addEventListener("click", async () => {
    const listName = nome_create_list.value;
    
    await User.createList(listName, boardId);
    container_criar_lista.classList.remove("active");
    window.location.reload();
  });
}

async function createCard(listId) {
  const container_criar_cartao = document.getElementById("container-criar-cartao");
  const fechar_create_card = document.getElementById("fechar-create-card");
  const nome_create_card = document.getElementById("nome-create-card");
  const botao_concluido_create_card = document.getElementById("botao-concluido-create-card");

  fechar_create_card.addEventListener("click", () => {
    container_criar_cartao.classList.remove("active");
  })
  
  container_criar_cartao.classList.add("active");
  
  botao_concluido_create_card.addEventListener("click", async () => {
    const cardName = nome_create_card.value;
    
    await User.createCard(cardName, listId);
    container_criar_cartao.classList.remove("active");
    window.location.reload();
  });
}

var user_name = document.getElementById("user_name")
async function getUserProps() {
  const user = await User.me();

  const user_image = document.getElementById("user-image");

  user_image.src = user.avatar_url;
  user_name.innerHTML = user.name;
}

async function getBoards(filter){
  board_content.style.display = "none";
  boards_container.style.display = "grid";

  var user_boards;
  try {
    user_boards = await User.getBoards();
  } catch (error) {
    Token.removeToken();
    window.location.reload();
  }

  if(filter === "favoritos") {
    user_boards = user_boards.filter(ub => ub.favorito === true);
  }
  
  boards_container.innerHTML = `
    ${
      user_boards.map(board => {
        return(
          `<div class="li-board" style="background:${board.color};">
            <span>${board.name}</span>
            <div class="board-actions-container">
              <button class="botao-excluir" value=${board.id}> 
                <i class="fa-solid fa-trash"></i>
              </button>
              <button class="board-favorito-button">
                ${
                  board.favorito ? (
                    '<i class="fa-solid fa-star"></i>' 
                  ) : (
                    '<i class="fa-regular fa-star"></i>'
                  )
                }
              </button>
            </div>
          </div>`
          )
      }).join("")
    }
  `;

  const boards = Object.values(document.getElementsByClassName("li-board"));
  boards.forEach((board, index) => {
    board.addEventListener("click", () => {
      var currentBoard = user_boards[index];

      showBoard(currentBoard.id)
    })
  })
  
  const botoes_excluir = document.getElementsByClassName("botao-excluir");
  const botoes = Object.values(botoes_excluir);

  botoes.forEach((botao, index) => {
    botao.addEventListener("click", async () => {
        var currentBoard = user_boards[index];

        await User.deleteBoard(currentBoard.id);
        window.location.reload();
    })
  });

  const boards_favoritos = document.getElementsByClassName("board-favorito-button");
  const boards_favorito_buttons = Object.values(boards_favoritos);

  boards_favorito_buttons.forEach((botao, index) => {
    botao.addEventListener("click", async () => {
      var currentBoard = user_boards[index];
      if(currentBoard.favorito) {
        currentBoard.favorito = false;
      }
      else {
        currentBoard.favorito = true;
      }
      
      await User.updateBoard(currentBoard);
      window.location.reload();
    })
  })

}


function createBoard(){
  const container_criar_board = document.getElementById("container-criar-board");
  container_criar_board.classList.add("active");

  const name = document.getElementById("nome-create-board");
  const color = document.getElementById("input-cor");
  const botao_concluido = document.getElementById("botao-concluido-create-board");

  const fechar_create_board = document.getElementById("fechar-create-board");

  fechar_create_board.addEventListener("click", () => {
    container_criar_board.classList.remove("active")
  })

  botao_concluido.addEventListener('click', () =>{
    User.createboard(name.value, color.value ).then(boards => {
      container_criar_board.classList.remove("active");
      window.location.reload();
    }).catc(error => {
      console.log(error.message);
    });

    getBoards();
  })
  
}

formLogin.addEventListener("submit", async event => {
  event.preventDefault();
  let formData = new FormData(formLogin);
  try {
    const token = await User.login(formData);
    Token.saveToken(token);
    forms.style.display = "none"
    tituloLogin.style.display = "none"
    container_home.classList.add("active");
    body.style.background = "#0f172a";
    body.style.color = "#f9fafb"
    getBoards();
    getUserProps();

  } catch (error) {
    alert(error.message)
  }
  
});

formCreateUser.addEventListener("submit", (event) => {
  event.preventDefault();
  const texto_erro_cadastro = document.getElementById("texto_erro_cadastro")
  const name = document.getElementById("new-name").value;
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;
  const avatar = document.getElementById("new-avatar").value;
  
  User.create(name, username, password, avatar).then(user=>{
    console.log(user);
    div_msg_cadastro.classList.toggle("active");
    setTimeout(() => {
      div_msg_cadastro.classList.toggle("active");
      formLogin.classList.remove("hidden");
      formCreateUser.classList.remove("active");
    }, 2000);
  }).catch(error => {
    console.log(error.message);
    texto_erro_cadastro.innerHTML = error;

  });
  
  
});

const cancel = document.getElementById("cancel-create-user");

cancel.addEventListener("click", () => {
  formLogin.classList.remove("hidden");
  formCreateUser.classList.remove("active");
})

botao_cadastro.addEventListener('click', () => {
  formLogin.classList.add("hidden");
  formCreateUser.classList.add("active");
})