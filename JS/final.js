window.onload = function () {																			// функція очікування завантаження сторінці
	let persons = [],																					// масив в якому зберігаються герої та їх властивості
		page = 1,																						// змінна для переходу для завантаження наступних персонажів
		nextItems = document.getElementById('next'),											// змінні по ідентифікаторах кнопок для завантаження наступних чи попередніх персонажів
		prevItems = document.getElementById('prev'),
		wrNames = document.getElementById('wrapperNames');										// змінна для відстежування події на дочірніх елементах для виводу інформації

	getData(page);																						// виклик функції для отримання даних для перших 10 персонажів
	nextItems.addEventListener('click', nextPage);
	prevItems.addEventListener('click', prevPage);

	wrNames.addEventListener('click', function addInfo(e) {								// слухач події "кліку" по картці персонажу

		let currentImg = document.querySelector('.image');										// знаходимо всі елементи таблиці в які будемо додавати відповідну інформацію
		let faceImg = document.querySelector('.face');
		let name = document.getElementById('name');
		let year = document.getElementById('year');
		let planet = document.getElementById('planet');
		let gender = document.getElementById('gender');
		let species = document.getElementById('species');
		let films = document.getElementById('films');
		let filmItems = document.querySelector('.filmItems');

		if (e.target.className == 'names') {															// перевірка, що "клік" саме на картці персонажа

			if (filmItems) {filmItems.remove()};														// видаляємо попередню інформацію, якщо вона є
			if (faceImg) {faceImg.remove()};

			let parseFilms = JSON.parse(window.localStorage.getItem(e.target.innerHTML + ' hisfilms'));		// дістаємо з локального сховища інформацію по фільмах конкретного персонажа
			rememberFilms(e.target.innerHTML, parseFilms);														// робимо запит на сервер передаємо імя персонажу та URL фільмів

			currentImg.insertAdjacentHTML('beforeend', '<img class="face" src= "IMG/' + e.target.innerHTML + '.jpg">'); 	// вставляємо зображення персонажа,
																																		// що відповідає тексту (ім'я персонажу)
																																		// у карточці

			films.insertAdjacentHTML('afterbegin', '<ul class="filmItems"></ul>');											// створюємо список для фільмів
			filmItems = document.querySelector('.filmItems');																	// знаходимо JS елемент для додавання пунктів
			for (let p of persons) {																	// перебираємо персонажів на сторінці та якщо ім'я збігається з ім'ям "таргету" події
				if (p.name == e.target.innerHTML) {														// додаємо відповідну інформацію з масиву персонажів
					name.innerHTML = p.name;
					year.innerHTML = p.birth_year;
					gender.innerHTML = p.gender;
					planet.innerHTML = window.localStorage.getItem(p.name + ' homeworld');			// додаємо інформацію що додатково запитували на сервері та
					species.innerHTML = window.localStorage.getItem(p.name + ' species');			// зберігали у локальному сховищі
					for (let i = 0; i < parseFilms.length; i++) {
						let film = JSON.parse(window.localStorage.getItem(p.name + ' films'));			// ситуація з фільмами трохи складніша їх може бути декілька у кожного персонажа
						filmItems.insertAdjacentHTML('beforeend', '<li>' + film[i] + '</li>')	// додаються тільки після другого "кліку по персонажу"!!!!
					}
				}
			}
		}
	});

	function nextPage () {														// функція що переходить до наступних 10 персонажів та викликає функцію запиту на сервер

		if (page != 9) {
			clear();
			page++;
			getData(page);
		}
		return;
	}
	function prevPage () {														// те саме тільки для попередніх

		if (page != 1) {
			clear();
			page--;
			getData(page);
		}
		return;
	}
	function getData(n) {														// функція отримання інформації з сервера по API
		let url = 'https://swapi.dev/api/people/?page='+ n,						// передаємо URL змінюючи номер сторінки
			init = {
				method: 'GET'
			};
		fetch(url, init).then(function (resp) {
			return resp.json();
		}).then(function (data) {
			persons = data.results;												// результат записуємо в масив персонажів
			setNames(persons);													// викликаємо функцію що створює картки персонажів з додаванням імен
			rememberPlanet(persons);											// функція для отримання назви планети для кожного персонажу по URL від сервера
			rememberSpecies(persons);											// функція для отримання виду (раси) персонажу
			for (let i = 0; persons.length; i++) {								// циклом зберігаємо URL фільмів кожного персонажу у локальне сховище, для подальшого отримання назв фільмів
				window.localStorage.setItem(persons[i].name + ' hisfilms', JSON.stringify(persons[i].films));
			}
		}).catch(function (err) {
			//console.error(err)												// вискакує якась помилка у консолі !!!
		});
	}

	function clear () {															// функція видаляє попередні картки персонажів при переміщенні до наступної групи
		let names = document.getElementsByClassName('names');
		let stop = names.length;
		for (let i = 0; i < stop; i++) {
			names[0].remove();
		}
	}

	function setNames (persons) {												// функція створює картки з іменами персонажів
		let items = document.getElementById('wrapperNames');
		for (let i = 0; i < persons.length; i ++) {
			items.insertAdjacentHTML('beforeend', '<div class="names">' + persons[i].name + '</div>');
		}
	}

	function rememberPlanet (persons) {											// функція робить запит по API отримуємо назви планет
		for (let i = 0; i < persons.length; i++) {
			let planetUrl = persons[i].homeworld;
			let url = planetUrl,
				init = {
					method: 'GET'
				};
			fetch(url, init).then(function (resp) {
				return resp.json();
			}).then(function (data) {
				window.localStorage.setItem(persons[i].name + ' homeworld', data.name);
			}).catch(function (err) {
				console.error(err)
			});
		}

	}
	function rememberSpecies (persons) {										// функція для отримання видів
		for (let i = 0; i < persons.length; i++) {
			let speciesUrl = persons[i].species;
			if (speciesUrl.length != 0) {
				let url = speciesUrl,
					init = {
						method: 'GET'
					};
				fetch(url, init).then(function (resp) {
					return resp.json();
				}).then(function (data) {
					window.localStorage.setItem(persons[i].name + ' species', data.name);
				}).catch(function (err) {
					console.error(err)
				});
			} else {
				window.localStorage.setItem(persons[i].name + ' species', 'Human');
			}
		}

	}

	function rememberFilms (name, films) {										// функція отримання назв фільмів
		let hisFilms = [];
		for (let j = 0; j < films.length; j++) {

			let url = films[j],
				init = {
					method: 'GET'
				};
			fetch(url, init).then(function (resp) {
				return resp.json();
			}).then(function (data) {

			hisFilms.push(data.title);

			window.localStorage.setItem(name + ' films', JSON.stringify(hisFilms));

			}).catch(function (err) {
				console.error(err)
			});
		}
	}
}