const bookshelfs = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
    return +new Date();
}

function generateBookshelfObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    };
}

function findBookshelf(bookshelfId) {
    for (const bookshelfItem of bookshelfs) {
        if (bookshelfItem.id === bookshelfId) {
            return bookshelfItem;
        }
    }
    return null;
}

function findBookshelfIndex(bookshelfId) {
    for (const index in bookshelfs) {
        if (bookshelfs[index].id === bookshelfId) {
            return index;
        }
    }
    return -1;
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelfs);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const bookshelf of data) {
            bookshelfs.push(bookshelf);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookshelf(bookshelfObject) {
    const { id, title, author, year, isCompleted } = bookshelfObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = 'Penulis: ' + author;

    const textYear = document.createElement('p');
    textYear.innerText = 'Tahun: ' + year;

    const container = document.createElement('article');
    container.classList.add('book_item')
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute('id', `bookshelf-${id}`);

    if (isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerHTML = 'Belum selesai di Baca';
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerHTML = 'Hapus buku';
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(id);
            alert('Data buku berhasil dihapus');
        });

        const action = document.createElement('div');
        action.classList.add('action')
        action.append(undoButton, trashButton);

        container.append(action);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('green');
        checkButton.innerHTML = 'Selesai dibaca';
        checkButton.addEventListener('click', function () {
            addTaskToCompleted(id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerHTML = 'Hapus buku';
        trashButton.addEventListener('click', function () {
            removeTaskFromCompleted(id);
            alert('Data buku berhasil dihapus');
        });

        const action = document.createElement('div');
        action.classList.add('action')
        action.append(checkButton, trashButton);

        container.append(action);
    }

    return container;
}

function addBookshelf() {
    const inputBookTitle = document.getElementById('inputBookTitle').value;
    const inputBookAuthor = document.getElementById('inputBookAuthor').value;
    const inputBookYear = document.getElementById('inputBookYear').value;
    const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete);
    bookshelfs.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function searchBookshelf() {
    const searchBookTitle = document.getElementById('searchBookTitle').value;
    const dataBook = bookshelfs.find(e => e.title === searchBookTitle);

    const searchBookshelfList = document.getElementById('searchBookshelfList');
    searchBookshelfList.innerHTML = '';

    if (dataBook) {
        const textTitle = document.createElement('h3');
        textTitle.innerText = dataBook.title;

        const textAuthor = document.createElement('p');
        textAuthor.innerText = 'Penulis: ' + dataBook.author;

        const textYear = document.createElement('p');
        textYear.innerText = 'Tahun: ' + dataBook.year;

        const textStatus = document.createElement('p');
        textStatus.innerText = 'Status Baca: ' + dataBook.isCompleted;

        searchBookshelfList.append(textTitle, textAuthor, textYear, textStatus);
    } else {
        const textTitle = document.createElement('h3');
        textTitle.innerText = 'Tidak ditemukan buku dengan Judul tersebut';
        searchBookshelfList.append(textTitle);
    }


    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addTaskToCompleted(bookshelfId) {
    const bookshelfTarget = findBookshelf(bookshelfId);

    if (bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeTaskFromCompleted(bookshelfId) {
    const bookshelfTarget = findBookshelfIndex(bookshelfId);

    if (bookshelfTarget === -1) return;

    bookshelfs.splice(bookshelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoTaskFromCompleted(bookshelfId) {

    const bookshelfTarget = findBookshelf(bookshelfId);
    if (bookshelfTarget == null) return;

    bookshelfTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBookshelf();
    });

    const searchForm = document.getElementById('searchBook');

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBookshelf();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookshelfList = document.getElementById('incompleteBookshelfList');
    const listCompleted = document.getElementById('completeBookshelfList');

    uncompletedBookshelfList.innerHTML = '';
    listCompleted.innerHTML = '';

    for (const bookshelfItem of bookshelfs) {
        const bookshelfElement = makeBookshelf(bookshelfItem);
        if (bookshelfItem.isCompleted) {
            listCompleted.append(bookshelfElement);
        } else {
            uncompletedBookshelfList.append(bookshelfElement);
        }
    }
});
