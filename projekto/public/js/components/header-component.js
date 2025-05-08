class MyHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        header {
          background: #007BFF;
          color: white;
          padding: 1rem;
          text-align: center;
        }
      </style>
      <header>
        <h2>Mi Cabecera Web Component</h2>
      </header>
    \`;
  }
}
customElements.define('my-header', MyHeader);