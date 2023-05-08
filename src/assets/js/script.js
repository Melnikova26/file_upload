import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, listAll, getMetadata } from "firebase/storage";

window.addEventListener("DOMContentLoaded", () => {
	const startBtn = document.querySelector('.main__setting'),
		backBtn = document.querySelector('.upload__setting'),
		main = document.querySelector('.main'),
		upload = document.querySelector('.upload'),
		form = document.querySelector('form'),
		recent = document.querySelector('.recent'),
		parent = document.querySelector('.recent__main'),
		viewMore = document.querySelector('.recent__btn'),
		uploadRecent = document.querySelectorAll('.upload__recent'),
		uploadNew = document.querySelectorAll('.upload__new'),
		folder = document.querySelector('.folder'),
		container = document.querySelector('.container'),
		error = document.querySelector('.modal'),
		close = document.querySelector('.modal__close'),
		fileInput = document.querySelector('.upload__file');


	const firebaseConfig = {
		apiKey: "AIzaSyA5Nm1FWzpXfIbfpIikEK5bqDTd3bP-huw",
		authDomain: "datastorage-81729.firebaseapp.com",
		projectId: "datastorage-81729",
		storageBucket: "datastorage-81729.appspot.com",
		messagingSenderId: "655552349194",
		appId: "1:655552349194:web:83ee71e427c8b0576b4bf3"
	};

	const app = initializeApp(firebaseConfig);

	const storage = getStorage();
	const listRef = ref(storage, 'files/');
	listAll(listRef)
		.then((res) => {
			const metadataList = [];
			res.items.forEach((itemRef) => {
				const forestRef = ref(storage, `files/${itemRef.name}`);
				metadataList.push(getMetadata(forestRef));
			});
			return Promise.all(metadataList);
		})
		.then((metadataList) => {
			metadataList.sort((a, b) => Date.parse(a.timeCreated) - Date.parse(b.timeCreated));
			metadataList.forEach((metadata, i) => {
				if(i >=( metadataList.length - 5) && i< metadataList.length){
					const uploadTime = metadata.timeCreated;
					const now = new Date();
					const date = new Date(Date.parse(uploadTime));
					const diff = Math.floor((now - date) / 60000);
					let time;
					if (diff < 60) {
						time = `${diff}m ago`;
					} else if (diff < 1440) {
						time = `${Math.floor(diff / 60)}h ago`;
					} else {
						time = `${Math.floor(diff / 1440)}d ago`;
					}
					const data = getData(metadata.name, metadata.size);
					newFiles(data.extend, metadata.name, data.fileSize, parent, time, 'hide');
				}
				
			});
	})
	.catch((error) => {
		console.log(error);
  });

	function getHide(clazz, ...args) {
		args.forEach(item => item.classList.toggle(clazz));
	}

	fileInput.onchange = ({target}) => {
		const file = target.files[0];
		if (file) {
			const fileName = file.name;
			const fileItem = file;
			uploadFile(fileName, fileItem);
		}
	};

	function uploadFile(fileName, fileItem) {
		try{
			getHide('hide', folder, recent);
			const storage = getStorage(app);
			const storageRef = ref(storage, `files/${fileName}`);
			const uploadTask = uploadBytesResumable(storageRef, fileItem);
			const data = getData(fileName);
			newFiles(data.extend, fileName, '', parent, '', '', 'hide');
			uploadTask.on('state_changed', (snapshot) => {
			const percent = document.querySelectorAll('.recent__percent')[0],
				  progress = document.querySelector('.progress'),
				  fileSize = document.querySelectorAll('.recent__size')[0],
				  recentTime = document.querySelectorAll('.recent__time')[0],
				  spinner = document.querySelector('.spinner__item'),
				  bar = document.querySelector('.bar');
			if (snapshot.totalBytes !== 0) {
				let percentVal = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
				percent.innerHTML = percentVal + '%';
				progress.style.width = percentVal + '%';
				if(percentVal >= 100){
					setTimeout(()=>{
						getHide('hide', percent, fileSize, spinner);
						bar.classList.add('hide');
						recentTime.textContent = 'recently';
					}, 500);
					if(snapshot.totalBytes < 10**6){
						fileSize.textContent = `${Math.round(snapshot.totalBytes/1024)}KB`;
					} else if(snapshot.totalBytes < 10**9) {
						fileSize.textContent = `${Math.round(snapshot.totalBytes/1024**2)}MB`;
					} else {
						fileSize.textContent = `${Math.round(snapshot.totalBytes/1024**3)}GB`;
					}
				}
			}
			});
		} catch (e) {
			getHide('hide', error, container);
		}
		
	}

	function getData(name, size = ''){
		let extend;
		let fileSize;
		switch (true) {
			case name.endsWith(".jpg"):
			case name.endsWith(".png"):
			case name.endsWith(".svg"):
			  extend = './assets/img/img.svg';
			  break;
			case name.endsWith(".pdf"):
			  extend = './assets/img/pdf.svg';
			  break;
			case name.endsWith(".pptx"):
			  extend = './assets/img/pptx.svg';
			  break;
			case name.endsWith(".doc"):
			case name.endsWith(".docx"):
			  extend = './assets/img/doc.svg';
			  break;
			default:
			  extend = './assets/img/folder.svg';
		}
		switch (true) {
			case size < 10**6:
			  fileSize = `${Math.round(size/1024)}KB`;
			  break;
			case size < 10**9:
			  fileSize = `${Math.round(size/(1024**2))}MB`;
			  break;
			case size < 10**12:
			  fileSize = `${Math.round(size/(1024**3))}GB`;
			  break;
			default:
			  fileSize = `${Math.round(size)}B`;
		}
		return {extend, fileSize};
	}

	function newFiles(extend, name, fileSize, parent, time, hide='', hideSize=''){
		const element = document.createElement('div');
		element.classList.add('recent__file');
		element.innerHTML = `
				<div class="recent__left">
					<div class="recent__img">
						<img src=${extend} alt="img">
					</div>
					<div class="recent__info">
						<div class="recent__name">${name}</div>
						<div class="recent__time">${time}</div>
					</div>
				</div>
				<div class="spinner__item ${hide}"></div>
				<div class="loading__scale bar ${hide}">
					<span class="loading progress" style="width: 50%"></span>
				</div>
				<div class="recent__right">
					<div class="recent__size ${hideSize}">${fileSize}</div>
					<div class="recent__percent ${hide}">50%</div>
					<div class="recent__ellipsis">
						<img src="./assets/img/ellipsis.svg" alt="Ellipsis">
					</div>
				</div>`;
		parent.prepend(element);
	}


	startBtn.addEventListener('click', ()=>getHide('hide', main, upload));
	backBtn.addEventListener('click', ()=>getHide('hide', main, upload));
	
	form.addEventListener('click', () => {
		fileInput.click();
	});
	viewMore.addEventListener('click', () => {
		parent.innerHTML = '';
		listAll(listRef)
			.then((res) => {
				const metadataList = [];
				res.items.forEach((itemRef) => {
					const forestRef = ref(storage, `files/${itemRef.name}`);
					metadataList.push(getMetadata(forestRef));
				});
				return Promise.all(metadataList);
			})
			.then((metadataList) => {
				metadataList.sort((a, b) => Date.parse(a.timeCreated) - Date.parse(b.timeCreated));
				metadataList.forEach((metadata, i) => {
						const uploadTime = metadata.timeCreated;
						const now = new Date();
						const date = new Date(Date.parse(uploadTime));
						const diff = Math.floor((now - date) / 60000);
						let time;
						if (diff < 60) {
							time = `${diff} min ago`;
						} else if (diff < 1440) {
							time = `${Math.floor(diff / 60)} h ago`;
						} else {
							time = `${Math.floor(diff / 1440)} d ago`;
						}
						const data = getData(metadata.name, metadata.size);
						newFiles(data.extend, metadata.name, data.fileSize, parent, time, 'hide');
				});
		})
		viewMore.style.visibility = 'hidden';
	});

	uploadNew[1].addEventListener('click', () => {
		getHide('hide', folder, recent);
	});
	uploadRecent[0].addEventListener('click', () => {
		getHide('hide', folder, recent);
	});
	close.addEventListener('click', () => {
		getHide('hide', error, container);
	});

	form.addEventListener('dragover', (e) => {
		e.preventDefault();
	});
	form.addEventListener('drop', (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) {
			const fileName = file.name;
			const fileItem = file;
			uploadFile(fileName, fileItem);
		}
	});
});


