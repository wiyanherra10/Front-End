const addButton = document.getElementById("add-book");
const UNCOMPLETED_BOOK_ID = "incompleteBookshelfList";
const COMPLETED_BOOK_ID = "completeBookshelfList";
const BOOK_ITEMID = "itemId";
const STORAGE_KEY = "BOOK_APPS";
let books = [];

const checkStorage = () => {
  if (typeof Storage == undefined) {
    alert("Browser Anda tidak mendukung Local Storage");
    return false;
  }

  return true;
};

const addBook = () => {
  const uncompletedBook = document.getElementById(UNCOMPLETED_BOOK_ID);
  const inputTitle = document.getElementById("inputBookTitle").value;
  const inputAuthor = document.getElementById("inputBookAuthor").value;
  const inputYear = document.getElementById("inputBookYear").value;

  const book = makeBook(inputTitle, inputAuthor, inputYear, false);
  const bookObject = composeBookObject(
    inputTitle,
    inputAuthor,
    inputYear,
    false
  );

  book[BOOK_ITEMID] = bookObject.id;
  books.push(bookObject);

  uncompletedBook.append(book);
  updateDataToStorage();
};

  const makeBook = (title, author, year, isCompleted) => {
    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = author;

    const bookYear = document.createElement("small");
    bookYear.innerText = `${year}`;

    const detail = document.createElement("div");
    detail.classList.add("detail-book");
    detail.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement("div");
    container.append(detail);

    if (isCompleted) {
      container.append(createUnreadButton(), createTrashButton());
    } else {
      container.append(createReadButton(), createTrashButton());
    }
    return container;
  };

  const createButton = (buttonTypeClass, eventListener) => {
    const button = document.createElement("button");
    button.classList.add(buttonTypeClass);
  
    button.addEventListener("click", function (event) {
      eventListener(event);
    });
    return button;
  };
  const createReadButton = () => {
    return createButton("read-button", function (event) {
      addBookToCompleted(event.target.parentElement);
    });
  };

  const addBookToCompleted = (bookElement) => {
    const bookCompleted = document.getElementById(COMPLETED_BOOK_ID);
  
    const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
    const bookAuthor = bookElement.querySelector(".detail-book > p").innerText;
    const bookYear = bookElement.querySelector(".detail-book > small").innerText;
  
    const newBook = makeBook(bookTitle, bookAuthor, bookYear, true);
    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = true;
    newBook[BOOK_ITEMID] = book.id;
  
    bookCompleted.append(newBook);
    bookElement.remove();
  
    updateDataToStorage();
  };

  const removeBookFromCompleted = (bookElement) => {
    const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
    books.splice(bookPosition, 1);
    bookElement.remove();
    updateDataToStorage();
  };

  const createTrashButton = () => {
    return createButton("trash-book", function (event) {
      removeBookFromCompleted(event.target.parentElement);
    });
  };

  const undoBookFromCompleted = (bookElement) => {
    const listUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
  
    const bookTitle = bookElement.querySelector(".detail-book > h3").innerText;
    const bookAuthor = bookElement.querySelector(".detail-book > p").innerText;
    const bookYear = bookElement.querySelector(".detail-book > small").innerText;
  
    const newBook = makeBook(bookTitle, bookAuthor, bookYear, false);
    const book = findBook(bookElement[BOOK_ITEMID]);
    book.isCompleted = false;
    newBook[BOOK_ITEMID] = book.id;
  
    listUncompleted.append(newBook);
    bookElement.remove();
    updateDataToStorage();
  };

  const createUnreadButton = () => {
    return createButton("unread-button", function (event) {
      undoBookFromCompleted(event.target.parentElement);
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
  const submitBook = document.getElementById("inputBook");
    submitBook.addEventListener("submit", function (event) {
      event.preventDefault();
      //modal.classList.remove("modal-open");
      addBook();
    });

    if (checkStorage()) {
      loadDatafromStorage();
    }
  });

  document.addEventListener("ondatasaved", () => {
    console.log("Data berhasil disimpan.");
    booksLength();
  });
  
  document.addEventListener("ondataloaded", () => {
    refreshDataFromBooks();
    booksLength();
  });

  const saveData = () => {
    const parseData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parseData);
    document.dispatchEvent(new Event("ondatasaved"));
  };
  
  const loadDatafromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);
  
    if (data !== null) books = data;
  
    document.dispatchEvent(new Event("ondataloaded"));
  };
  
  const updateDataToStorage = () => {
    if (checkStorage()) saveData();
  };
  
  const composeBookObject = (bookTitle, bookAuthor, bookYear, isCompleted) => {
    return {
      id: +new Date(),
      bookTitle,
      bookAuthor,
      bookYear,
      isCompleted,
    };
  };

  const findBook = (bookId) => {
    for (book of books) {
      if (book.id === bookId) return book;
    }
  
    return null;
  };
  
  const findBookIndex = (bookId) => {
    let index = 0;
    for (book of books) {
      if (book.id === bookId) return index;
  
      index++;
    }
  
    return -1;
  };
  
  const refreshDataFromBooks = () => {
    const bookUncompleted = document.getElementById(UNCOMPLETED_BOOK_ID);
    let bookCompleted = document.getElementById(COMPLETED_BOOK_ID);
  
    for (book of books) {
      const newBook = makeBook(
        book.bookTitle,
        book.bookAuthor,
        book.bookYear,
        book.isCompleted
      );
      newBook[BOOK_ITEMID] = book.id;
  
      if (book.isCompleted) {
        bookCompleted.append(newBook);   
      } else {
        bookUncompleted.append(newBook);
      }
    }
  };