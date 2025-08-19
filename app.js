"use strict";

(async () => {
    const API_KEY = 'f02b9c1a61d905d779461c3e1359fdc0ec4db7b857580b75bbe9668be93b77ae';
    const CACHE_AGE_IN_SECONDS = 30;

    const getData = async (url, apiKey) => {
        let data = localStorage.getItem(url);
        if (data) {
            data = JSON.parse(data);
            const { createdAt } = data;
            if ((new Date(createdAt).getTime() + CACHE_AGE_IN_SECONDS * 1000) > new Date().getTime()) {
                console.log('cache hit');
                return data;
            }
        }
        data = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } }).then(response => response.json());
        localStorage.setItem(url, JSON.stringify({ data: JSON.stringify(data), createdAt: new Date() }));
        console.log('cache miss');
        console.log(data);
        return data;
    };

    const loadCoins = async (symbolFilter = "") => {
        const url = 'https://rest.coincap.io/v3/assets?limit=100';
        const response = await getData(url, API_KEY);
        const all = JSON.parse(response.data).data;

        const filtered = symbolFilter ? all.filter(c => (c.symbol || "").toUpperCase() === symbolFilter.toUpperCase()) : all;

        const coins = filtered.slice(0, 20);

        const container = document.getElementById('coins-container');
        container.innerHTML = "";

        if (coins.length === 0) {
            container.innerHTML = `<div class="alert alert-warning">No results for symbol "${symbolFilter}".</div>`;
            return;
        }

        coins.forEach(({ id, name, symbol }) => {
            const card = document.createElement("div");
            card.className = "col-md-4";
            card.innerHTML = `
          <div class="card h-100 shadow">
            <div class="card-body">
              <h5 class="card-title">${symbol}</h5>
              <p class="card-text">${name}</p>
              <button class="btn btn-sm btn-info more-info-btn" data-id="${id}">More Info</button>
              <div class="more-info mt-2" id="info-${id}"></div>
            </div>
          </div>
        `;
            container.appendChild(card);
        });
    };

    const buttonsNow = document.getElementsByClassName('more-info-btn');
    for (let i = 0; i < buttonsNow.length; i++) {
        buttonsNow[i].onclick = function () {
            toggleMoreInfo(this.getAttribute('data-id'));
        };
    }

    

    const buttons = document.getElementsByClassName('more-info-btn');
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
        toggleMoreInfo(this.getAttribute('data-id'));
    });
}

const toggleMoreInfo = async (coinId) => {
    const container = document.getElementById(`info-${coinId}`);
    if (container.innerHTML) {
        container.innerHTML = "";
        return;
    }

    const url = `https://rest.coincap.io/v3/assets/${coinId}`;
    const response = await getData(url, API_KEY);
    const coin = JSON.parse(response.data).data;

    container.innerHTML = `
        <img src="https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png" width="50" />
        <ul class="list-unstyled">
            <li>USD: $${(+coin.priceUsd).toFixed(2)}</li>
            <li>Change 24h: ${(+coin.changePercent24Hr).toFixed(2)}%</li>
        </ul>
    `;
};  


const pages = {
    home: () => {
        document.getElementById("main-content").innerHTML = `
      <div class="mb-3">
        <div class="input-group">
          <input id="search-symbol" type="text" class="form-control" placeholder="Search by symbol (e.g. BTC)" />
          <button id="btn-search" class="btn btn-primary">Search</button>
          <button id="btn-clear" class="btn btn-outline-secondary">Clear</button>
        </div>
      </div>
      <div id="coins-container" class="row gy-4"></div>
    `;

        const btnSearch = document.getElementById("btn-search");
        if (btnSearch) {
            btnSearch.onclick = function () {
                const inp = document.getElementById("search-symbol");
                const term = inp ? inp.value.trim() : "";
                loadCoins(term);
            };
        }

        const btnClear = document.getElementById("btn-clear");
        if (btnClear) {
            btnClear.onclick = function () {
                const inp = document.getElementById("search-symbol");
                if (inp) inp.value = "";
                loadCoins("");
            };
        }
        loadCoins();
    },
    reports: () => {
        document.getElementById("main-content").innerHTML = `<h2>Reports (in progress)</h2>`;
    },
    about: () => {
        document.getElementById("main-content").innerHTML = `
        <h2>About Me</h2>
        <p>This is a project by Yossi GOld</p>
        <img src="your-photo.jpg" alt="Me" class="img-thumbnail" width="200"/>
      `;
    },
};

const loadPage = (page) => pages[page]?.();

const nav = document.getElementById("nav");
if (nav) {
    Nav.addEventListener("click", (e) => {
        if (e.target && e.target.dataset && e.target.dataset.page) {
            loadPage(e.target.dataset.page);
        }
    });
}

loadPage("home");
}) ();
