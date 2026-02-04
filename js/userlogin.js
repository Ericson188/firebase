import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDHPjJtGjW2E-cCoJ56r4IkfYcJ1oX6yyc",
    authDomain: "apps-57140.firebaseapp.com",
    projectId: "apps-57140",
    storageBucket: "apps-57140.firebasestorage.app",
    messagingSenderId: "548004749500",
    appId: "1:548004749500:web:968809052a36f9ad45b0b9",
    measurementId: "G-GNQP4SG9ZH"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // DOM elements
  const authSection = document.getElementById("authSection");
  const notesSection = document.getElementById("notesSection");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userDisplay = document.getElementById("userDisplay");
  const noteTitle = document.getElementById("noteTitle");
  const noteContent = document.getElementById("noteContent");
  const noteCategory = document.getElementById("noteCategory");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const updateNoteBtn = document.getElementById("updateNoteBtn");
  const notesList = document.getElementById("notesList");
  const emptyState = document.getElementById("emptyState");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const categoryFilter = document.getElementById("categoryFilter");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");
  const newCategoryInput = document.getElementById("newCategoryInput");
  const createCategoryBtn = document.getElementById("createCategoryBtn");
  const visibleCount = document.getElementById("visibleCount");
  const totalCount = document.getElementById("totalCount");
  const currentPage = document.getElementById("currentPage");
  const totalPages = document.getElementById("totalPages");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const pageNumbers = document.getElementById("pageNumbers");
  const pageSizeSelect = document.getElementById("pageSizeSelect");
  const pagination = document.getElementById("pagination");
  
  // Modal elements
  const noteModal = document.getElementById("noteModal");
  const closeModal = document.getElementById("closeModal");
  const modalNoteTitle = document.getElementById("modalNoteTitle");
  const modalNoteInfo = document.getElementById("modalNoteInfo");
  const modalNoteContent = document.getElementById("modalNoteContent");
  const modalCopyBtn = document.getElementById("modalCopyBtn");
  const modalEditBtn = document.getElementById("modalEditBtn");
  const modalDeleteBtn = document.getElementById("modalDeleteBtn");
  
  // Checklist elements
  const toggleChecklistBtn = document.getElementById("toggleChecklistBtn");
  const checklistContainer = document.getElementById("checklistContainer");
  const checklistItems = document.getElementById("checklistItems");
  const addChecklistItemBtn = document.getElementById("addChecklistItemBtn");
  const modalChecklistContainer = document.getElementById("modalChecklistContainer");
  const modalChecklistItems = document.getElementById("modalChecklistItems");

  let editNoteId = null;
  let currentNoteId = null;
  let allNotes = [];
  let filteredNotes = [];
  let currentPageNum = 1;
  let pageSize = 6;
  let searchQuery = '';
  let categoryFilterValue = 'all';
  let userCategories = ['Personal', 'Work', 'Others'];
  
  // Checklist variables
  let showChecklist = false;
  let checklistData = [];

  // Show toast notification
  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden', 'opacity-0');
    toast.classList.add('opacity-100');
    
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2000);
  }

  // Checklist functions
  function toggleChecklist() {
    showChecklist = !showChecklist;
    checklistContainer.classList.toggle('hidden', !showChecklist);
    toggleChecklistBtn.innerHTML = showChecklist 
      ? '<i class="fas fa-minus mr-1"></i> Hide Checklist'
      : '<i class="fas fa-list mr-1"></i> Add Checklist';
    
    if (!showChecklist) {
      checklistData = [];
      renderChecklistItems();
    } else if (checklistData.length === 0) {
      // Add first item when showing checklist
      addChecklistItem();
    }
  }

  function addChecklistItem(text = '', completed = false) {
    const itemId = Date.now() + Math.random();
    checklistData.push({ id: itemId, text, completed });
    renderChecklistItems();
    focusLastChecklistItem();
  }

  function removeChecklistItem(itemId) {
    checklistData = checklistData.filter(item => item.id !== itemId);
    renderChecklistItems();
  }

  function updateChecklistItem(itemId, newText) {
    const item = checklistData.find(item => item.id === itemId);
    if (item) {
      item.text = newText;
    }
  }

  function toggleChecklistItem(itemId) {
    const item = checklistData.find(item => item.id === itemId);
    if (item) {
      item.completed = !item.completed;
      renderChecklistItems();
    }
  }

  function renderChecklistItems() {
    checklistItems.innerHTML = '';
    
    checklistData.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'flex items-center gap-2 group';
      itemElement.innerHTML = `
        <input 
          type="checkbox" 
          ${item.completed ? 'checked' : ''}
          class="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        >
        <input 
          type="text" 
          value="${item.text}" 
          placeholder="Add checklist item..."
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <button class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      const checkbox = itemElement.querySelector('input[type="checkbox"]');
      const textInput = itemElement.querySelector('input[type="text"]');
      const deleteBtn = itemElement.querySelector('button');
      
      checkbox.addEventListener('change', () => toggleChecklistItem(item.id));
      textInput.addEventListener('input', (e) => updateChecklistItem(item.id, e.target.value));
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addChecklistItem();
        } else if (e.key === 'Backspace' && e.target.value === '') {
          e.preventDefault();
          removeChecklistItem(item.id);
        }
      });
      deleteBtn.addEventListener('click', () => removeChecklistItem(item.id));
      
      checklistItems.appendChild(itemElement);
    });
  }

  function focusLastChecklistItem() {
    setTimeout(() => {
      const inputs = checklistItems.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    }, 10);
  }

  function renderModalChecklist(note) {
    if (note.checklist && note.checklist.length > 0) {
      modalChecklistContainer.classList.remove('hidden');
      modalChecklistItems.innerHTML = '';
      
      note.checklist.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg';
        itemElement.innerHTML = `
          <input 
            type="checkbox" 
            ${item.completed ? 'checked' : ''}
            disabled
            class="h-5 w-5 text-blue-600 rounded border-gray-300 ${item.completed ? 'bg-blue-600' : ''}"
          >
          <span class="flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}">
            ${item.text}
          </span>
        `;
        modalChecklistItems.appendChild(itemElement);
      });
    } else {
      modalChecklistContainer.classList.add('hidden');
    }
  }

  // Get category color
  function getCategoryColor(category) {
    const colors = {
      Personal: 'bg-green-100 text-green-800',
      Work: 'bg-blue-100 text-blue-800',
      Others: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Initialize categories in dropdowns
  function initializeCategories() {
    // Clear existing options
    noteCategory.innerHTML = '';
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add categories to both dropdowns
    userCategories.forEach(category => {
      const option1 = document.createElement('option');
      option1.value = category;
      option1.textContent = category;
      noteCategory.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = category;
      option2.textContent = category;
      categoryFilter.appendChild(option2);
    });
  }

  // Filter notes based on search query and category
  function filterNotes() {
    let filtered = allNotes;
    
    if (searchQuery) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilterValue !== 'all') {
      filtered = filtered.filter(note => 
        note.category === categoryFilterValue
      );
    }
    
    return filtered;
  }

  // Render pagination controls
  function renderPagination() {
    const totalPagesCount = Math.ceil(filteredNotes.length / pageSize);
    
    pageNumbers.innerHTML = '';
    currentPage.textContent = currentPageNum;
    totalPages.textContent = totalPagesCount;
    
    if (totalPagesCount <= 1) {
      pagination.classList.add('hidden');
      return;
    }
    
    pagination.classList.remove('hidden');
    
    // Determine which page numbers to show
    let startPage = Math.max(1, currentPageNum - 1);
    let endPage = Math.min(totalPagesCount, currentPageNum + 1);
    
    // Adjust if we're near the start or end
    if (currentPageNum <= 2) {
      endPage = Math.min(3, totalPagesCount);
    }
    if (currentPageNum >= totalPagesCount - 1) {
      startPage = Math.max(1, totalPagesCount - 2);
    }
    
    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `px-3 py-1 rounded-lg transition-colors btn ${i === currentPageNum ? 'pagination-btn active' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPageNum = i;
        renderNotes();
      });
      pageNumbers.appendChild(pageBtn);
    }
    
    // Update prev/next buttons
    prevPageBtn.disabled = currentPageNum === 1;
    nextPageBtn.disabled = currentPageNum === totalPagesCount;
    
    prevPageBtn.className = `px-3 py-1 rounded-lg transition-colors btn ${currentPageNum === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
    nextPageBtn.className = `px-3 py-1 rounded-lg transition-colors btn ${currentPageNum === totalPagesCount ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
  }

  // LOGIN ONLY
  loginBtn.addEventListener("click", async () => {
    const emailValue = email.value.trim();
    const passwordValue = password.value;
    const personalEmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;
    
    if (!personalEmailRegex.test(emailValue)) {
      showToast("Please use a personal email (Gmail, Yahoo, Outlook)");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      showToast("Logged in successfully!");
    } catch (err) {
      if (err.code === "auth/user-not-found") showToast("Email not found! Contact admin.");
      else if (err.code === "auth/wrong-password") showToast("Incorrect password!");
      else showToast(err.message);
    }
  });

  // LOGOUT
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    showToast("Logged out successfully!");
  });

  // AUTH STATE
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authSection.classList.add("hidden");
      notesSection.classList.remove("hidden");
      userDisplay.textContent = user.email;
      initializeCategories();
      loadNotes();
    } else {
      authSection.classList.remove("hidden");
      notesSection.classList.add("hidden");
    }
  });

  // ADD NOTE
  addNoteBtn.addEventListener("click", async () => {
    if (!auth.currentUser) {
      showToast("You must login first!");
      return;
    }
    
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const category = noteCategory.value;
    
    if (!title || !content) {
      showToast("Please enter both title and content!");
      return;
    }

    try {
      const noteData = {
        userId: auth.currentUser.uid,
        title,
        content,
        category,
        createdAt: new Date().toISOString()
      };
      
      // Add checklist data if it exists
      if (showChecklist && checklistData.length > 0) {
        noteData.checklist = checklistData.filter(item => item.text.trim() !== '');
      }
      
      await addDoc(collection(db, "notes"), noteData);
      
      noteTitle.value = "";
      noteContent.value = "";
      checklistData = [];
      showChecklist = false;
      checklistContainer.classList.add('hidden');
      toggleChecklistBtn.innerHTML = '<i class="fas fa-list mr-1"></i> Add Checklist';
      renderChecklistItems();
      showToast("Note added successfully!");
      loadNotes();
    } catch (err) {
      console.error(err);
      showToast("Error adding note: " + err.message);
    }
  });

  // LOAD NOTES
  // LOAD NOTES - Temporary workaround without ordering
async function loadNotes() {
    const q = query(
      collection(db, "notes"),
      where("userId", "==", auth.currentUser.uid)
      // Remove orderBy temporarily until index is created
      // orderBy("createdAt", "desc")
    );
  
    const snapshot = await getDocs(q);
    allNotes = [];
    
    snapshot.forEach(docSnap => {
      const note = docSnap.data();
      allNotes.push({
        id: docSnap.id,
        ...note
      });
    });
    
    // Sort locally as a temporary solution
    allNotes.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    renderNotes();
  }

  // RENDER NOTES
  function renderNotes() {
    notesList.innerHTML = "";
    
    filteredNotes = filterNotes();
    const totalPagesCount = Math.ceil(filteredNotes.length / pageSize);
    
    // Ensure current page is valid
    if (currentPageNum > totalPagesCount && totalPagesCount > 0) {
      currentPageNum = totalPagesCount;
    } else if (totalPagesCount === 0) {
      currentPageNum = 1;
    }
    
    // Get notes for current page
    const startIndex = (currentPageNum - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);
    
    // Update counts
    totalCount.textContent = allNotes.length;
    visibleCount.textContent = filteredNotes.length;
    
    if (paginatedNotes.length === 0) {
      emptyState.classList.remove("hidden");
      notesList.classList.add("hidden");
      pagination.classList.add("hidden");
      return;
    }
    
    emptyState.classList.add("hidden");
    notesList.classList.remove("hidden");
    
    // Render notes
    paginatedNotes.forEach(note => {
      const noteCard = document.createElement("div");
      noteCard.className = "note-card bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all h-full flex flex-col";
      
      noteCard.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-800 truncate flex-1 mr-2">${note.title}</h3>
          <div class="flex items-center gap-2">
            ${note.checklist && note.checklist.length > 0 ? '<i class="fas fa-list text-blue-500 text-sm"></i>' : ''}
            <span class="category-tag ${getCategoryColor(note.category)} text-xs">
              ${note.category}
            </span>
          </div>
        </div>
        <p class="text-gray-600 text-sm mb-2 flex-grow overflow-hidden" style="max-height: 60px;">
          ${note.content}
        </p>
        <div class="text-xs text-gray-500 mb-3">
          ${formatDate(note.createdAt)}
        </div>
        <div class="flex justify-between pt-2 border-t border-gray-100">
          <button class="viewBtn text-blue-600 hover:text-blue-900 btn flex items-center text-xs" data-id="${note.id}">
            <i class="fas fa-eye mr-1"></i> View
          </button>
          <div class="flex space-x-2">
            <button class="editBtn text-indigo-600 hover:text-indigo-900 btn" data-id="${note.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="deleteBtn text-red-600 hover:text-red-900 btn" data-id="${note.id}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      notesList.appendChild(noteCard);
    });

    document.querySelectorAll(".viewBtn").forEach(btn => 
      btn.onclick = () => viewNote(btn.dataset.id)
    );
    document.querySelectorAll(".editBtn").forEach(btn => 
      btn.onclick = () => startEdit(btn.dataset.id)
    );
    document.querySelectorAll(".deleteBtn").forEach(btn => 
      btn.onclick = () => deleteNote(btn.dataset.id)
    );
    
    renderPagination();
  }

  // VIEW NOTE IN MODAL
  async function viewNote(id) {
    currentNoteId = id;
    const noteRef = doc(db, "notes", id);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists() && noteSnap.data().userId === auth.currentUser.uid) {
      const note = noteSnap.data();
      modalNoteTitle.textContent = note.title;
      modalNoteInfo.innerHTML = `
        <span class="category-tag ${getCategoryColor(note.category)} mr-2">
          ${note.category}
        </span>
        <span>• ${formatDate(note.createdAt)}</span>
      `;
      modalNoteContent.textContent = note.content;
      
      // Render checklist in modal
      renderModalChecklist(note);
      
      // Show modal
      noteModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      showToast("Cannot view: note not found or you don't have permission.");
    }
  }

  // CLOSE MODAL
  function closeNoteModal() {
    noteModal.classList.remove('open');
    document.body.style.overflow = '';
    currentNoteId = null;
  }

  // DELETE NOTE
  async function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteDoc(doc(db, "notes", id));
      showToast("Note deleted successfully!");
      loadNotes();
    }
  }

  // EDIT NOTE
  async function startEdit(id) {
    editNoteId = id;
    const noteRef = doc(db, "notes", id);
    const noteSnap = await getDoc(noteRef);

    if (noteSnap.exists() && noteSnap.data().userId === auth.currentUser.uid) {
      const note = noteSnap.data();
      noteTitle.value = note.title;
      noteContent.value = note.content;
      noteCategory.value = note.category;
      
      // Handle checklist data for existing notes
      if (note.checklist && note.checklist.length > 0) {
        showChecklist = true;
        checklistContainer.classList.remove('hidden');
        toggleChecklistBtn.innerHTML = '<i class="fas fa-minus mr-1"></i> Hide Checklist';
        checklistData = [...note.checklist];
      } else {
        showChecklist = false;
        checklistContainer.classList.add('hidden');
        toggleChecklistBtn.innerHTML = '<i class="fas fa-list mr-1"></i> Add Checklist';
        checklistData = [];
      }
      renderChecklistItems();

      addNoteBtn.classList.add("hidden");
      updateNoteBtn.classList.remove("hidden");
    } else {
      showToast("Cannot edit: note not found or you don't have permission.");
    }
  }

  // UPDATE NOTE
  updateNoteBtn.addEventListener("click", async () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const category = noteCategory.value;
    
    if (!title || !content) {
      showToast("Please enter both title and content!");
      return;
    }

    const updateData = { 
      title, 
      content, 
      category,
      updatedAt: new Date().toISOString()
    };
    
    // Add checklist data if it exists
    if (showChecklist && checklistData.length > 0) {
      updateData.checklist = checklistData.filter(item => item.text.trim() !== '');
    } else {
      updateData.checklist = [];
    }
    
    await updateDoc(doc(db, "notes", editNoteId), updateData);
    
    editNoteId = null;
    noteTitle.value = "";
    noteContent.value = "";
    checklistData = [];
    showChecklist = false;
    checklistContainer.classList.add('hidden');
    toggleChecklistBtn.innerHTML = '<i class="fas fa-list mr-1"></i> Add Checklist';
    renderChecklistItems();
    addNoteBtn.classList.remove("hidden");
    updateNoteBtn.classList.add("hidden");
    showToast("Note updated successfully!");
    loadNotes();
  });

  // SEARCH FUNCTIONALITY
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPageNum = 1;
    renderNotes();
  });

  // CLEAR SEARCH
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    currentPageNum = 1;
    renderNotes();
  });

  // CATEGORY FILTER
  categoryFilter.addEventListener('change', (e) => {
    categoryFilterValue = e.target.value;
    currentPageNum = 1;
    renderNotes();
  });

  // CREATE NEW CATEGORY
  createCategoryBtn.addEventListener('click', () => {
    const newCategory = newCategoryInput.value.trim();
    if (!newCategory) {
      showToast('Please enter a category name!');
      return;
    }
    
    if (userCategories.includes(newCategory)) {
      showToast('Category already exists!');
      return;
    }
    
    userCategories.push(newCategory);
    initializeCategories();
    newCategoryInput.value = '';
    showToast('Category created successfully!');
  });

  // ADD CATEGORY FROM DROPDOWN
  addCategoryBtn.addEventListener('click', () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && newCategory.trim()) {
      const category = newCategory.trim();
      
      if (userCategories.includes(category)) {
        showToast('Category already exists!');
        return;
      }
      
      userCategories.push(category);
      initializeCategories();
      showToast('Category created successfully!');
    }
  });

  // DELETE CATEGORY
  deleteCategoryBtn.addEventListener('click', () => {
    const selectedCategory = noteCategory.value;
    
    if (userCategories.length <= 1) {
      showToast('You need at least one category!');
      return;
    }
    
    // Check if category is in use
    const isCategoryInUse = allNotes.some(note => note.category === selectedCategory);
    if (isCategoryInUse) {
      if (confirm(`The category "${selectedCategory}" is in use. Deleting it will reassign all related notes to "Personal". Continue?`)) {
        // In a real app, you would update all notes with this category
        userCategories = userCategories.filter(cat => cat !== selectedCategory);
        initializeCategories();
        showToast(`Category "${selectedCategory}" deleted. Please manually update affected notes.`);
      }
      return;
    }
    
    // If category is not in use, delete it
    if (confirm(`Are you sure you want to delete the "${selectedCategory}" category?`)) {
      userCategories = userCategories.filter(cat => cat !== selectedCategory);
      initializeCategories();
      showToast(`Category "${selectedCategory}" deleted successfully!`);
    }
  });

  // PAGINATION CONTROLS
  prevPageBtn.addEventListener('click', () => {
    if (currentPageNum > 1) {
      currentPageNum--;
      renderNotes();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPagesCount = Math.ceil(filteredNotes.length / pageSize);
    if (currentPageNum < totalPagesCount) {
      currentPageNum++;
      renderNotes();
    }
  });

  // PAGE SIZE SELECTOR
  pageSizeSelect.addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPageNum = 1;
    renderNotes();
  });

  // MODAL FUNCTIONALITY
  closeModal.addEventListener('click', closeNoteModal);
  
  // Close modal when clicking outside the content
  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) {
      closeNoteModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && noteModal.classList.contains('open')) {
      closeNoteModal();
    }
  });
  
  // Modal action buttons
  modalCopyBtn.addEventListener('click', () => {
    if (currentNoteId !== null) {
      const noteContent = modalNoteContent.textContent;
      navigator.clipboard.writeText(noteContent);
      showToast('Note content copied to clipboard!');
      closeNoteModal();
    }
  });
  
  modalEditBtn.addEventListener('click', () => {
    if (currentNoteId !== null) {
      closeNoteModal();
      setTimeout(() => startEdit(currentNoteId), 300);
    }
  });
  
  modalDeleteBtn.addEventListener('click', () => {
    if (currentNoteId !== null) {
      closeNoteModal();
      setTimeout(() => deleteNote(currentNoteId), 300);
    }
  });

  // Allow adding note with Enter key in content field
  noteContent.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editNoteId) {
        updateNoteBtn.click();
      } else {
        addNoteBtn.click();
      }
    }
  });
  
  // Checklist event listeners
  toggleChecklistBtn.addEventListener('click', toggleChecklist);
  
  addChecklistItemBtn.addEventListener('click', () => {
    addChecklistItem();
  });
});
