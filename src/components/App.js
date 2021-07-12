import React from "react";
import { BrowserRouter, Route, Redirect, Switch, Link } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import Header from "./Header";
import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import Footer from "./Footer";
import Main from "./Main";
import DeleteConfirmPopup from "./DeleteConfirmPopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ImagePopup from "./ImagePopup";
import Loader from "./Loader";
import api from "../utils/api";
import onLoadImage from "../images/profile/Card-load.gif"
import onSuccessAuth from "../images/popup/ok.svg"
import onFailureAuth from "../images/popup/fail.svg"
import {CurrentUserContext} from '../contexts/CurrentUserContext';

function App() {

  const buttonCaptionDefault = {add: "Создать", delete: "Да", others: "Сохранить"}

  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [isLoaderVisible, setLoaderVisible] = React.useState(true);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cardToDelete, setCardToDelete] = React.useState(null);
  const [buttonCaption, setButtonCaption] = React.useState(buttonCaptionDefault);
  const [currentUser, setCurrentUser] = React.useState({name: "Идёт загрузка...", avatar: onLoadImage, about: "", _id: 0});
  const [cards, setCards] = React.useState([]);

  React.useEffect(() => {

    Promise.all([api.getUserInfo(), api.getInitialCards()])
    .then(([userData, cards]) => {
      setCurrentUser(userData);
      setCards(cards);
    })
    .catch(([userDataError, cardsError]) => {
      alert(userDataError);
      alert(cardsError);
    })
    .finally(()=>{
      setLoaderVisible(false);
    });
  }, []);

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    if(isLiked){
      api.dislikeCard(card._id)
      .then((result) => {
        setCards((state) => state.map((c) => c._id === card._id ? result : c));
      })
      .catch((error) => {
        alert(error);
      });
    }
    else{
      api.likeCard(card._id)
      .then((result) => {
        setCards((state) => state.map((c) => c._id === card._id ? result : c));
      })
      .catch((error) => {
        alert(error);
      });
    }
  } 

  function handleCardDelete(card){
    setCardToDelete(card);
  }

  function handleCardClick(card){
    setSelectedCard(card);
  }

  function handleEditAvatarClick(){
    setEditAvatarPopupOpen(true);
  }
  
  function handleEditProfileClick(){
    setEditProfilePopupOpen(true);
  }
  
  function handleAddPlaceClick(){
    setAddPlacePopupOpen(true);
  }

  function closeAllPopups(){
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setSelectedCard(null);
    setCardToDelete(null);
  }

  function handleUpdateUser({name, about}){
    setButtonCaption({add: "Создать", delete: "Да", others: "Сохранение..."});
    api.setUserInfo({
      newName: name, 
      newAbout: about
    })
    .then((result) => {
      setCurrentUser(result);
      closeAllPopups();
    })
    .catch((error) => {
      alert(error);
    })
    .finally(()=>{
      setButtonCaption(buttonCaptionDefault);
    });
  }

  function handleUpdateAvatar({avatar}){
    setButtonCaption({add: "Создать", delete: "Да", others: "Сохранение..."});
    api.updateAvatar(avatar)
    .then((result) => {
      setCurrentUser(result);
      closeAllPopups();
    })
    .catch((error) => {
      alert(error);
    })
    .finally(()=>{
      setButtonCaption(buttonCaptionDefault);
    });
  }

  function handleAddPlaceSubmit({title, link}){
    setButtonCaption({add: "Сохранение...", delete: "Да", others: "Сохранить"});
    api.createNewCard({
      newTitle: title,
      newLink: link
    })
    .then((result) => {
      setCards([result, ...cards]);
      closeAllPopups();
    })
    .catch((error) => {
      alert(error);
    })
    .finally(() => {
      setButtonCaption(buttonCaptionDefault);
    });
  }

  function handleDelete(card){
    setButtonCaption({add: "Создать", delete: "Удаление...", others: "Сохранить"});
    api.removeCard(card._id)
    .then(() => {
      setCards((state) => state.filter(c => c._id !== card._id));
      closeAllPopups();
    })
    .catch((error) => {
      alert(error);
    })
    .finally(()=>{
      setButtonCaption(buttonCaptionDefault);
    });
  }

  return (
    <BrowserRouter>
      <div className="page page__content">
        <CurrentUserContext.Provider value={currentUser}>
          <Header location={"Войти"}/>
            {/*<ProtectedRoute
              path="/"
              loggedIn={true}
              component={Main}
              cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete}
              onEditAvatar={handleEditAvatarClick} onEditProfile={handleEditProfileClick} 
              onAddPlace={handleAddPlaceClick} onCardClick={handleCardClick}
            />*/}
            <Route exact path="/">
              <Main
                cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete}
                onEditAvatar={handleEditAvatarClick} onEditProfile={handleEditProfileClick} 
                onAddPlace={handleAddPlaceClick} onCardClick={handleCardClick}
              />
            </Route>
            <Route exact path="/">
              <Footer/>
            </Route>
            <Route exact path="/">
              <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} buttonCaption={buttonCaption}/>
              <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} buttonCaption={buttonCaption}/>
              <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} buttonCaption={buttonCaption}/> 
              <DeleteConfirmPopup card={cardToDelete} onClose={closeAllPopups} onDelete={handleDelete} buttonCaption={buttonCaption}/>
              <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
              <Loader isVisible={isLoaderVisible} image={onLoadImage}/>
            </Route>
            <Switch>
              <Route exact path="/sign-in">
                <Login />
              </Route>
              <Route exact path="/sign-up">
                <Register />
              </Route>
              <Route exact path="/">
                {true ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
              </Route>
          </Switch>
          <InfoTooltip name={"InfoTooltip"} isOpen={false} image={onSuccessAuth} text={"Вы успешно зарегистрировались!"} onClose={closeAllPopups}/>
        </CurrentUserContext.Provider>
      </div>
    </BrowserRouter>


    /*<div className="page page__content">
      <CurrentUserContext.Provider value={currentUser}>
        <Header location={"Войти"}/>
        {/*<Login />
        <Register/>
        <Main
          cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete}
          onEditAvatar={handleEditAvatarClick} onEditProfile={handleEditProfileClick} 
          onAddPlace={handleAddPlaceClick} onCardClick={handleCardClick}
        />
        <Loader isVisible={isLoaderVisible} image={onLoadImage}/>
        <Footer/>
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} buttonCaption={buttonCaption}/>
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} buttonCaption={buttonCaption}/>
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} buttonCaption={buttonCaption}/> 
        <DeleteConfirmPopup card={cardToDelete} onClose={closeAllPopups} onDelete={handleDelete} buttonCaption={buttonCaption}/>
        <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
        <InfoTooltip name={"InfoTooltip"} isOpen={false} image={onSuccessAuth} text={"Вы успешно зарегистрировались!"} onClose={closeAllPopups}/>
      </CurrentUserContext.Provider>
      </div>*/
  );
}

export default App;