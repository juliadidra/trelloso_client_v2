import fetch from "./fetch.js";
import Fetch from "./fetch.js";

async function login(loginFormData) {
    const token = await Fetch.request('/auth/token', loginFormData, 'POST');
    return token;
}

async function updatePerfil(nome, avatar_url, senha) {
    const userData = await me()
    const user = {
        name: nome, avatar_url, password: senha, username: userData.username
    };

    const update_perfil = await Fetch.request(`/users/${userData.id}`, user, "PATCH");
    return update_perfil;
}

async function getAll() {
    const users = await Fetch.request('/users')
    return users;
}

async function getUser(userId) {
    return await Fetch.request(`/users/${userId}`);
}

async function create(name, username, password, avatar) {
    const user = {
        name: name, username: username, password: password, avatar_url: avatar
    }
    const newUser = await Fetch.request('/users', user, 'POST');
    return newUser;
}

async function me() {
    const user = await Fetch.request('/users/me');
    return user;
}

async function getBoards() {
    const user_boards = await Fetch.request('/users/me/boards', undefined, 'GET');   
    return user_boards;   
}

async function getBoard(id) {
    const board = await Fetch.request(`/boards/${id}`);
    return board;
}

async function createList(listName, boardId) {
    const list = {
        name: listName,
        board_id: boardId,
        position: 0
    }

    const newList = await Fetch.request("/lists", list, "POST");
    return newList;
}

async function getList(listId) {
    return await Fetch.request(`/lists/${listId}`);
}

async function deleteList(listId) {
    return await fetch.request(`/lists/${listId}`, undefined, "DELETE");
}

async function getCardsList(listId) {
    const cards = await Fetch.request(`/lists/${listId}/cards`);
    return cards;
}

async function createCard(cardName, listId) {
    const card = {
        name: cardName,
        date: new Date().toISOString(),
        list_id: listId,
        position: 0
    }

    const newCard = await Fetch.request("/cards", card, "POST");
    return newCard;
}

async function getCard(cardId) {
    return await Fetch.request(`/cards/${cardId}`);
}

async function deleteCard(cardId) {
    return await Fetch.request(`/cards/${cardId}`, undefined, "DELETE")
}

async function createCardComment(cardId, comment) {
    const newComment = {
        card_id: cardId,
        comment: comment
    };

    return await Fetch.request("/card_comments", newComment, "POST");
}

async function createCardMember(cardId, username) {
    const users = await getAll();
    const currentUser = users.find(user => user.username == username);

    const member = {
        card_id: cardId,
        member_id: currentUser.id
    }

    return await Fetch.request("/card_members", member, "POST");
}

async function createboard(name, color, favorito, id) {
    const boards = {
        name: name, color: color, favorito: favorito, id: id 
    } 
    const newboard = await Fetch.request('/boards', boards, 'POST')  
    return newboard;   
}

async function deleteBoard(id){
    
    const removeboard = await Fetch.request(`/boards/${id}`, undefined, 'DELETE');  
    return removeboard;
}

async function updateBoard({ id, name, color, favorito }) {
    const board = {
        id, name, color, favorito
    };

    const update_board = await Fetch.request(`/boards/${id}`, board, "PATCH");
    return update_board
}

export default { 
    login, 
    getAll, 
    create,
    getUser,
    me, 
    getBoards, 
    getBoard, 
    createList,
    getList,
    deleteList, 
    createCard,
    getCard,
    deleteCard,
    createCardComment,
    createCardMember,
    getCardsList, 
    createboard, 
    deleteBoard, 
    updateBoard,
    updatePerfil
};