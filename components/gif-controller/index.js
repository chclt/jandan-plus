import '@webcomponents/custom-elements';
import { parseGIF, decompressFrames } from '@flyskywhy/gifuct-js'

customElements.define('cherry-gif', class extends HTMLElement {
    static get observedAttributes() { return [ 'preload', 'autoplay', 'poster', 'src' ]; }
    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
<style>
:host {
    position: relative;
    display: block;
    width: 400px;
}

canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.media-controls-enclosure {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    pointer-events: none;
    background: bottom / auto 112px linear-gradient(hsla(0, 0%, 0%, 0) 0%, hsla(0, 0%, 0%, 0.013) 8.1%, hsla(0, 0%, 0%, 0.049) 15.5%, hsla(0, 0%, 0%, 0.104) 22.5%, hsla(0, 0%, 0%, 0.175) 29%, hsla(0, 0%, 0%, 0.259) 35.3%, hsla(0, 0%, 0%, 0.352) 41.2%, hsla(0, 0%, 0%, 0.45) 47.1%, hsla(0, 0%, 0%, 0.55) 52.9%, hsla(0, 0%, 0%, 0.648) 58.8%, hsla(0, 0%, 0%, 0.741) 64.7%, hsla(0, 0%, 0%, 0.825) 71%, hsla(0, 0%, 0%, 0.896) 77.5%, hsla(0, 0%, 0%, 0.951) 84.5%, hsla(0, 0%, 0%, 0.987) 91.9%, hsl(0, 0%, 0%) 100%) no-repeat;
    opacity: 0;
    transition: opacity 0.2s ease;
}

:host(:hover) .media-controls-enclosure {
    opacity: 1;
}

.media-controls-enclosure.show {
    opacity: 1;
}

.media-controls-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
}

.media-controls-button-group {
    display: flex;
    justify-content: space-between;
}

.media-controls-button-panel {
    display: flex;
    align-items: center;
}

.media-controls-button {
    position: relative;
    width: 48px;
    height: 48px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
}

.media-controls-button::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 6px;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    transition: background-color 0.2s ease 0s;
}

.media-controls-button:hover::before {
    background-color: rgba(32, 33, 36, 0.71);
}

.play::before {
    background: center / 22px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xOCAxMVYxMEgxN1Y5SDE1VjdIMTNWNUgxMVYzSDVWMjFIMTFWMjBWMTlIMTNWMTdIMTVWMTVIMTdWMTRIMThWMTNIMTlWMTFIMThaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.pause::before {
    background: center / 22px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik04IDIxSDdWMjBINlY0SDdWM0g4TDEwIDNMMTAgMjFIOFoiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBkPSJNMTYgMjFIMTdWMjBIMThWNEgxN1YzSDE2TDE0IDNMMTQgMjFIMTZaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.loading::before {
    background: center / 22px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik00IDE2SDNWMTRIMlY4SDNWNkg0VjRINlYzSDdWMkg5VjFIMTRWM0gxMFY0SDhWNUg3VjZINVY5SDRWMTNINVYxNEg3VjExSDlWMTlIMVYxN0g0VjE2WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0yMCA3SDIzVjVIMTVWMTNIMTdWMTBIMTlWMTFIMjBWMTVIMTlWMThIMTdWMTlIMTZWMjBIMTRWMjFIMTBWMjNIMTVWMjJIMTdWMjFIMThWMjBIMjBWMThIMjFWMTZIMjJWMTBIMjFWOEgyMFY3WiIgZmlsbD0id2hpdGUiLz4NCjwvc3ZnPg==) no-repeat;
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    100% { transform: rotate(-360deg); }
}

.prev-frame::before {
    background: center / 22px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0xOSAyMVYxOS45MzUySDIwVjRMMTkgNFYzTDE3IDNMMTcgMjFIMTlaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTQgMTRMNCAxM0gzTDMgMTFINEw0IDEwSDVWOUg3VjdIOVY1TDExIDVWM0wxNCAzTDE0IDIxSDExVjE5SDlWMTdIN1YxNUw1IDE1VjE0SDRaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.next-frame::before {
    background: center / 22px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik01IDNWNC4wNjQ4Mkg0VjIwSDVWMjFIN1YzSDVaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTIwIDEwVjExSDIxVjEzSDIwVjE0SDE5VjE1SDE3VjE3SDE1VjE5SDEzVjIxSDEwVjNIMTNWNUgxNVY3SDE3VjlIMTlWMTBIMjBaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.playback-speed::before, .playback-speed-4::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNNyAxNS41VjE0SDguNVYxMUg3VjkuNUg4LjVWOEgxMFYxNEgxMS41VjE1LjVIN1oiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBkPSJNMTMgMTUuNVYxNEgxNC41VjExSDE2VjE0SDE0LjVWMTUuNUgxM1pNMTMgMTFWOS41SDE0LjVWMTFIMTNaTTE2IDE1LjVWMTRIMTcuNVYxNS41SDE2Wk0xNiAxMVY5LjVIMTcuNVYxMUgxNloiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}

.playback-speed-1::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOC4wMDE4IDE1LjVWMTRIOS41MDE4VjE1LjVIOC4wMDE4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS41MDE4IDE1LjVWMTIuNUgxMy4wMDE4VjE0SDE2LjAwMThWMTUuNUgxMS41MDE4Wk0xMS41MDE4IDkuNVY4SDE0LjUwMThWOS41SDExLjUwMThaTTEzLjAwMTggMTIuNVYxMUgxNC41MDE4VjkuNUgxNi4wMDE4VjExSDE0LjUwMThWMTIuNUgxMy4wMDE4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xNy41MDE4IDE1LjVWMTRIMTkuMDAxOFYxMUgyMC41MDE4VjE0SDE5LjAwMThWMTUuNUgxNy41MDE4Wk0xNy41MDE4IDExVjkuNUgxOS4wMDE4VjExSDE3LjUwMThaTTIwLjUwMTggMTUuNVYxNEgyMi4wMDE4VjE1LjVIMjAuNTAxOFpNMjAuNTAxOCAxMVY5LjVIMjIuMDAxOFYxMUgyMC41MDE4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMS45OTgyIDkuNVYxNEgzLjQ5ODJWMTUuNUg0Ljk5ODJWMTRINi40OTgyVjkuNUg0Ljk5ODJWOEgzLjQ5ODJWOS41SDEuOTk4MlpNMy40OTgyIDkuNUg0Ljk5ODJWMTRIMy40OTgyVjkuNVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4NCg==) no-repeat;
}

.playback-speed-2::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yLjk4MjYgM0g0Ljk4MjYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTguOTgyNiAzTDExLjk4MjYgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMTUuOTgyNiAzTDIwLjk4MjYgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMi45ODI2IDIxSDQuOTgyNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOC45ODI2IDIxSDExLjk4MjYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE1Ljk4MjYgMjFIMjAuOTgyNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNNy45ODQ0NCAxNS41VjE0SDkuNDg0NDRWMTUuNUg3Ljk4NDQ0WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS40ODQ0IDE1LjVWMTRIMTQuNDg0NFYxMi41SDE1Ljk4NDRWMTRIMTQuNDg0NFYxNS41SDExLjQ4NDRaTTExLjQ4NDQgMTIuNVY4SDE1Ljk4NDRWOS41SDEyLjk4NDRWMTFIMTQuNDg0NFYxMi41SDExLjQ4NDRaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTE3LjQ4NDQgMTUuNVYxNEgxOC45ODQ0VjExSDIwLjQ4NDRWMTRIMTguOTg0NFYxNS41SDE3LjQ4NDRaTTE3LjQ4NDQgMTFWOS41SDE4Ljk4NDRWMTFIMTcuNDg0NFpNMjAuNDg0NCAxNS41VjE0SDIxLjk4NDRWMTUuNUgyMC40ODQ0Wk0yMC40ODQ0IDExVjkuNUgyMS45ODQ0VjExSDIwLjQ4NDRaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yLjAxNTY2IDkuNVYxNEgzLjUxNTY2VjE1LjVINS4wMTU2NlYxNEg2LjUxNTY2VjkuNUg1LjAxNTY2VjhIMy41MTU2NlY5LjVIMi4wMTU2NlpNMy41MTU2NiA5LjVINS4wMTU2NlYxNEgzLjUxNTY2VjkuNVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}

.playback-speed-3::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zLjAwMDAzIDNINS4wMDAwMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOS4wMDAwMyAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMy4wMDAwMyAyMUg1LjAwMDAzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05LjAwMDAzIDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNNy45ODg3NCAxNS41VjE0SDkuNDg4NzRWMTUuNUg3Ljk4ODc0WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS40ODg3IDkuNVY4SDE1Ljk4ODdWMTFIMTQuNDg4N1Y5LjVIMTEuNDg4N1pNMTIuOTg4NyAxNS41VjExSDE0LjQ4ODdWMTUuNUgxMi45ODg3WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xNy40ODg3IDE1LjVWMTRIMTguOTg4N1YxMUgyMC40ODg3VjE0SDE4Ljk4ODdWMTUuNUgxNy40ODg3Wk0xNy40ODg3IDExVjkuNUgxOC45ODg3VjExSDE3LjQ4ODdaTTIwLjQ4ODcgMTUuNVYxNEgyMS45ODg3VjE1LjVIMjAuNDg4N1pNMjAuNDg4NyAxMVY5LjVIMjEuOTg4N1YxMUgyMC40ODg3WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMi4wMTEyOSA5LjVWMTRIMy41MTEyOVYxNS41SDUuMDExMjlWMTRINi41MTEyOVY5LjVINS4wMTEyOVY4SDMuNTExMjlWOS41SDIuMDExMjlaTTMuNTExMjkgOS41SDUuMDExMjlWMTRIMy41MTEyOVY5LjVaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+DQo=) no-repeat;
}

.playback-speed-5::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMiAxNS41VjE0SDMuNVYxMUgyVjkuNUgzLjVWOEg1VjE0SDYuNVYxNS41SDJaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTggMTUuNVYxNEg5LjVWMTUuNUg4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS41IDE1LjVWMTIuNUgxM1YxNEgxNlYxNS41SDExLjVaTTExLjUgOS41VjhIMTQuNVY5LjVIMTEuNVpNMTMgMTIuNVYxMUgxNC41VjkuNUgxNlYxMUgxNC41VjEyLjVIMTNaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTE3LjUgMTUuNVYxNEgxOVYxMUgyMC41VjE0SDE5VjE1LjVIMTcuNVpNMTcuNSAxMVY5LjVIMTlWMTFIMTcuNVpNMjAuNSAxNS41VjE0SDIyVjE1LjVIMjAuNVpNMjAuNSAxMVY5LjVIMjJWMTFIMjAuNVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}

.playback-speed-6::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMiAxNS41VjE0SDMuNVYxMUgyVjkuNUgzLjVWOEg1VjE0SDYuNVYxNS41SDJaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTggMTUuNVYxNEg5LjVWMTUuNUg4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS41IDE1LjVWMTRIMTQuNVYxMi41SDE2VjE0SDE0LjVWMTUuNUgxMS41Wk0xMS41IDEyLjVWOEgxNlY5LjVIMTNWMTFIMTQuNVYxMi41SDExLjVaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTE3LjUgMTUuNVYxNEgxOVYxMUgyMC41VjE0SDE5VjE1LjVIMTcuNVpNMTcuNSAxMVY5LjVIMTlWMTFIMTcuNVpNMjAuNSAxNS41VjE0SDIyVjE1LjVIMjAuNVpNMjAuNSAxMVY5LjVIMjJWMTFIMjAuNVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}

.playback-speed-7::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMiAxNS41VjE0SDMuNVYxMUgyVjkuNUgzLjVWOEg1VjE0SDYuNVYxNS41SDJaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTggMTUuNVYxNEg5LjVWMTUuNUg4WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMS41IDkuNVY4SDE2VjExSDE0LjVWOS41SDExLjVaTTEzIDE1LjVWMTFIMTQuNVYxNS41SDEzWiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xNy41IDE1LjVWMTRIMTlWMTFIMjAuNVYxNEgxOVYxNS41SDE3LjVaTTE3LjUgMTFWOS41SDE5VjExSDE3LjVaTTIwLjUgMTUuNVYxNEgyMlYxNS41SDIwLjVaTTIwLjUgMTFWOS41SDIyVjExSDIwLjVaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}


.playback-speed-8::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDNINSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNOSAzTDEyIDMiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPg0KPHBhdGggZD0iTTE2IDNMMjEgMyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNMyAyMUg1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik05IDIxSDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJzcXVhcmUiLz4NCjxwYXRoIGQ9Ik0xNiAyMUgyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIi8+DQo8cGF0aCBkPSJNNyAxNS41VjEyLjVIOC41VjE0SDExLjVWMTUuNUg3Wk03IDkuNVY4SDEwVjkuNUg3Wk04LjUgMTIuNVYxMUgxMFY5LjVIMTEuNVYxMUgxMFYxMi41SDguNVoiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBkPSJNMTMgMTUuNVYxNEgxNC41VjExSDE2VjE0SDE0LjVWMTUuNUgxM1pNMTMgMTFWOS41SDE0LjVWMTFIMTNaTTE2IDE1LjVWMTRIMTcuNVYxNS41SDE2Wk0xNiAxMVY5LjVIMTcuNVYxMUgxNloiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}


.playback-mode::before, .playback-mode-forward::before {
    background: center / 20px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yMCAxMVYxMFY5SDE4VjdIMTZWNUgxNFYzSDEyVjJIMTBWNUgxMlY3SDE0VjlIMTZWMTFIMThWMTNIMTZWMTVIMTRWMTdIMTJWMTlIMTBWMjJIMTJWMjFIMTRWMTlIMTZWMThWMTdIMThWMTZWMTVIMjBWMTRWMTNIMjJWMTJWMTFIMjBaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTEyIDExVjEwVjlIMTBWN0g4VjVINlYzSDRWMkgyVjVINFY3SDZWOUg4VjExSDEwVjEzSDhWMTVINlYxN0g0VjE5SDJWMjJINFYyMUg2VjE5SDhWMThWMTdIMTBWMTZWMTVIMTJWMTRWMTNIMTRWMTJWMTFIMTJaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.playback-mode-reverse::before {
    background: center / 20px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik00IDExVjEwVjlINlY3SDhWNUgxMFYzSDEyVjJIMTRWNUgxMlY3SDEwVjlIOFYxMUg2VjEzSDhWMTVIMTBWMTdIMTJWMTlIMTRWMjJIMTJWMjFIMTBWMTlIOFYxOFYxN0g2VjE2VjE1SDRWMTRWMTNIMlYxMlYxMUg0WiIgZmlsbD0id2hpdGUiLz4NCjxwYXRoIGQ9Ik0xMiAxMVYxMFY5SDE0VjdIMTZWNUgxOFYzSDIwVjJIMjJWNUgyMFY3SDE4VjlIMTZWMTFIMTRWMTNIMTZWMTVIMThWMTdIMjBWMTlIMjJWMjJIMjBWMjFIMThWMTlIMTZWMThWMTdIMTRWMTZWMTVIMTJWMTRWMTNIMTBWMTJWMTFIMTJaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.playback-mode-bounce::before {
    background: center / 20px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik05IDEyLjVIMTFWMTAuNUgxMlY4LjVIMTFWNi41SDlWNC41SDdWMi41SDVWMS41SDNWNC41SDVWNi41SDdWOC41SDlWMTAuNUg3VjEyLjVINVYxNC41SDNWMTcuNUg1VjE2LjVIN1YxNC41SDlWMTIuNVoiIGZpbGw9IndoaXRlIi8+DQo8cGF0aCBkPSJNMTUgMTcuNUgxM1YxNS41SDEyVjEzLjVIMTNWMTEuNUgxNVY5LjVIMTdWNy41SDE5VjYuNUgyMVY5LjVIMTlWMTEuNUgxN1YxMy41SDE1VjE1LjVIMTdWMTcuNUgxOVYxOS41SDIxVjIyLjVIMTlWMjEuNUgxN1YxOS41SDE1VjE3LjVaIiBmaWxsPSJ3aGl0ZSIvPg0KPC9zdmc+) no-repeat;
}

.download::before {
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik03IDExVjEzSDlWMTVIMTFWMTdIMTNWMTVIMTVWMTNIMTdWMTFIMTlWOEgxN1Y5SDE1VjExSDE0VjEySDEzVjNIMTFWMTJIMTBWMTFIOVY5SDdWOEg1VjExSDdaIiBmaWxsPSJ3aGl0ZSIvPg0KPHBhdGggZD0iTTE5IDE3VjE5SDVWMTdIM1YyMUgyMVYxN0gxOVoiIGZpbGw9IndoaXRlIi8+DQo8L3N2Zz4=) no-repeat;
}

.media-controls-current-frame-display {
    margin-left: 20px;
    color: white;
    user-select: none;
}

.media-controls-progress-panel {
    padding: 0 16px 20px;
    cursor: pointer;
}

.media-controls-progress {
    position: relative;
    display: flex;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.25);
    pointer-events: none;
}

.media-controls-progress-track-loded, 
.media-controls-progress-track-played,
.media-controls-progress-track-thumb {
    position: absolute;
    left: 0;
    display: flex;
    justify-content: flex-end;
    height: 100%;
}

.media-controls-progress-track-loded {
    width: var(--p-decode);
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.54);
}

.media-controls-progress-track-played {
    width: var(--p-play);
    border-radius: 4px;
    background-color: white;
}

.media-controls-progress-track-thumb {
    min-width: 8px;
    width: var(--p-play);
    border-radius: 4px;
}

.media-controls-progress-thumb {
    width: 8px;
    height: 8px;
    position: relative;
    overflow: visible;
    opacity: 0;
    transition: opacity 0.2s ease 0s;
}

.media-controls-progress-thumb::before {
    content: '';
    display: block;
    position: absolute;
    margin: -8px 0 0 -8px;
    width: 24px;
    height: 24px;
    background: center / 24px url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik00IDZWN0g4VjVIMTZWN0gyMFY2SDE3VjRIN1Y2SDRaIiBmaWxsPSIjRkZEOTMzIi8+DQo8cGF0aCBkPSJNMTEgNFYxSDEyVjJIMTRWNEgxMVoiIGZpbGw9IiNFMzM1MzciLz4NCjxwYXRoIGQ9Ik00IDE3VjdIOFY1SDE2VjdIMjBWMTdINFoiIGZpbGw9IiNGRkVCMzMiLz4NCjxyZWN0IHg9IjEwIiB5PSIxNCIgd2lkdGg9IjQiIGhlaWdodD0iMyIgZmlsbD0iI0ZGNjUzOCIvPg0KPHBhdGggZD0iTTcgMTJWMTBIOVYxMkg3WiIgZmlsbD0iIzM2MzQzMyIvPg0KPHBhdGggZD0iTTE1IDEyVjEwSDE3VjEySDE1WiIgZmlsbD0iIzM2MzQzMyIvPg0KPC9zdmc+) no-repeat;
}

.media-controls-progress-panel:hover .media-controls-progress-thumb {
    opacity: 1;
}

</style>

    <canvas width="0" height="0"></canvas>
    <div class="media-controls-enclosure show">
        <div class="media-controls-panel">
            <div class="media-controls-button-group">
                <div class="media-controls-button-panel">
                    <button data-action="prev-frame" class="prev-frame media-controls-button" aria-label="previous frame"></button>
                    <button data-action="play" class="play-pause play media-controls-button" aria-label="play"></button>
                    <button data-action="next-frame" class="next-frame media-controls-button" aria-label="previous frame"></button>
                    <span class="media-controls-current-frame-display"></span>
                </div>
                <div class="media-controls-button-panel">
                    <button data-action="playback-speed" class="playback-speed playback-speed-4 media-controls-button" aria-label="previous frame"></button>
                    <button data-action="playback-mode" class="playback-mode media-controls-button" aria-label="play"></button>
                    <button data-action="download" class="download media-controls-button" aria-label="previous frame"></button>
                </div>
            </div>

            <div class="media-controls-progress-panel" style="--p-decode: 0%; --p-play: 0%;">
                <div class="media-controls-progress">
                    <div class="media-controls-progress-track-loded"></div>
                    <div class="media-controls-progress-track-played"></div>
                    <div class="media-controls-progress-track-thumb">
                        <div class="media-controls-progress-thumb"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

        this.paused = false;
        this.playbackRate = 1;
        this.playbackMode = 'forward';
        this._bounceCount = 0;

        this._pointerEvent = {};
    }

    connectedCallback() {
        (async () => {
            this.crossorigin = this.hasAttribute('crossorigin') ? true : false;

            this.poster = this.getAttribute('poster');
            this._canvas = this.shadowRoot.querySelector('canvas');
            this._ctx = this._canvas.getContext('2d', { willReadFrequently: true });
            this.poster && this._drawPoster();

            this._parseAttribute('preload') ? await this.fetch(false) : this.pause();
            this._parseAttribute('autoplay') && (await this.fetch(false), await this.load(), this.play());
        })();

        this.shadowRoot.querySelector('.media-controls-button-group').addEventListener('click', async (event) => {
            let action = event.target.getAttribute('data-action');

            switch (action) {
                case 'play':
                case 'prev-frame':
                case 'next-frame':
                    if (this._fetching) return;
                    try {
                        if (!this._fetched) await this.fetch(true);
                        else if (!this._loaded) await this.load();
                    } catch (error) {
                        return;
                    }

                    break;

            }

            switch (action) {
                case 'play':
                    if (this.paused) {
                        this.play();
                    } else {
                        this.pause();
                    }
                    break;
                case 'prev-frame':
                    if (this._canvasSize != 'gif') {
                        this.renderGIF();
                        this._frameIndex = 1;
                    }

                    this.pause()
                    this._frameIndex = --this._frameIndex < 0 ? this._loadedFrames.length - 1 : this._frameIndex;
                    this.renderFrame();
                    break;
                case 'next-frame':
                    if (this._canvasSize != 'gif') {
                        this.renderGIF();
                        this._frameIndex = -1;
                    }

                    this.pause()
                    this._frameIndex = ++this._frameIndex >= this._loadedFrames.length ? 0 : this._frameIndex;
                    this.renderFrame();
                    break;
                case 'playback-speed':
                    this.shadowRoot.querySelector('.playback-speed').classList.remove(`playback-speed-${this.playbackRate / 0.25}`);
                    this.playbackRate = this.playbackRate + 0.25 > 2 ? 0.25 : this.playbackRate + 0.25;
                    this.shadowRoot.querySelector('.playback-speed').classList.add(`playback-speed-${this.playbackRate / 0.25}`);
                    break;
                case 'playback-mode':
                    if (this.playbackMode === 'forward') {
                        this.playbackMode = 'bounce'
                        this.shadowRoot.querySelector('.playback-mode').classList.add('playback-mode-bounce');
                    } else if (this.playbackMode === 'bounce') {
                        this.playbackMode = 'reverse'
                        this.shadowRoot.querySelector('.playback-mode').classList.remove('playback-mode-bounce');
                        this.shadowRoot.querySelector('.playback-mode').classList.add('playback-mode-reverse');
                    } else {
                        this.playbackMode = 'forward'
                        this.shadowRoot.querySelector('.playback-mode').classList.remove('playback-mode-reverse');
                    }
                    break;
                case 'download':
                    if (!this._imageSrc) this._parseSrc();
                    let a = document.createElement('a');
                    a.href = this._imageSrc;
                    a.download = this._imageSrc.split('/').pop();
                    a.click();
                    break;
            }
        });


        this.shadowRoot.querySelector('.media-controls-progress-panel').addEventListener('pointerdown', (event) => {
            if (!this._fetched) return;

            event.preventDefault();

            let temp = event.currentTarget.querySelector('.media-controls-progress');

            this._pointerEvent.start = {
                fullWidth: temp.clientWidth,
                p: event.currentTarget.style.getPropertyValue('--p-play').replace('%', '') / 100,
                positionX: event.pageX,
                paused: this.paused,

            };
            this.pause();

            event.stopPropagation();
        });

        document.addEventListener('pointermove', (event) => {
            if (!this._pointerEvent.start) return;

            event.preventDefault();

            this._pointerEvent.move = {
                positionX: event.pageX
            };

            let p = this._pointerEvent.start.p + (this._pointerEvent.move.positionX - this._pointerEvent.start.positionX) / this._pointerEvent.start.fullWidth;
            p = p < 0 ? 0 : p > 1 ? 1 : p;
            this._frameIndex = Math.floor(p * (this._loadedFrames.length - 1));
            this.renderFrame();

            event.stopPropagation();
        });

        document.addEventListener('pointerup', (event) => {
            if (!this._pointerEvent.start) return;

            event.preventDefault();

            if (!this._pointerEvent.start.paused) this.play();
            this._pointerEvent = {};

            event.stopPropagation();
        });
    }

    _parseAttribute(name) {
        let value;
        switch (name) {
            case 'preload':
                return this.preload = this.getAttribute('preload') === 'none' ? false : true;
                break;
            case 'autoplay':
                value = this.getAttribute('autoplay');
                if (value === '') return this.autoplay = true;
                else return this.autoplay = value === 'false' ? false : (this._parseAttribute('preload') ? true : false);
                break;
        }
    }

    disconnectedCallback() {
        this.pause();
    }

    _drawPoster() {
        if (this.poster) {
            let poster = new Image();
            poster.onload = (event) => {
                if (this._timeoutID) return; // play started
                this.shadowRoot.querySelector('canvas').width = poster.width;
                this.shadowRoot.querySelector('canvas').height = poster.height;
                this.shadowRoot.querySelector('canvas').getContext('2d').drawImage(poster, 0, 0);
                this._canvasSize = 'poster';
            }
            poster.src = this.poster;
        }
    }

    _parseSrc() {
        let imageSrc;
        let source = this.querySelector('source');
        if (source) {
            imageSrc = source.getAttribute('src');
        } else {
            imageSrc = this.getAttribute('src');
        }
        return this._imageSrc = imageSrc;
    }

    async fetch(autoload = true) {
        if (this._fetching) return;

        this._parseSrc();

        if (!this._imageSrc) return;
        if (this._fetched == this._imageSrc) return;

        this._fetching = true;
        // this.shadowRoot.querySelector('.play-pause').classList.add('loading');
        this._fetched = this._imageSrc;
        this.shadowRoot.querySelector('.media-controls-current-frame-display').innerText = `加载中`;


        try {
            let response = await fetch(this._imageSrc, { mode: this.crossorigin ? 'cors' : 'no-cors' });

            if (!response.ok) {
                this._fetched = false;
                throw new Error(response);
            }

            let contentLength = response.headers.get('content-length');
            let reader = response.body.getReader();
            let receivedLength = 0;
            let chunks = [];
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(value);
                receivedLength += value.length;

                this.shadowRoot.querySelector('.media-controls-current-frame-display').innerText = `加载中 ${Math.floor((receivedLength / contentLength) * 100)}%`;
                this.shadowRoot.querySelector('.media-controls-progress-panel').style.setProperty('--p-decode', `${receivedLength / contentLength * 100}%`);
            }

            let chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for (let chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            this._fetching = false;
            // this.shadowRoot.querySelector('.play-pause').classList.remove('loading');

            this._gifBuffer = parseGIF(chunksAll);

            if (autoload) this.load();

        } catch (error) {
            this._fetched = false;
            this._fetching = false;
            // this.shadowRoot.querySelector('.play-pause').classList.remove('loading');
            this.shadowRoot.querySelector('.media-controls-current-frame-display').innerText = `加载失败`;
            throw error;
        }
    }

    async load() {
        if (this._fetching) return;

        if (!this._fetched) await this.fetch(false);

        this.pause();
        if (this._timeoutID) {
            clearTimeout(this._timeoutID);
        }

        // gif patch canvas
        this._tempCanvas = document.createElement('canvas');
        this._tempCtx = this._tempCanvas.getContext('2d', { willReadFrequently: true });
        // full gif canvas
        this._gifCanvas = document.createElement('canvas');
        this._gifCtx = this._gifCanvas.getContext('2d', { willReadFrequently: true });

        this._loadedFrames = [];
        this._frameIndex = 0;
        this._frameImageData = null;
        this._needsDisposal = false;

        this._loadedFrames = decompressFrames(this._gifBuffer, true);
        this.shadowRoot.querySelector('.media-controls-current-frame-display').innerText = `0 / ${this._loadedFrames.length - 1}`;
        this._loaded = true;

    }

    renderGIF() {
        switch (this.playbackMode) {
          case 'reverse':
            this._frameIndex = this._loadedFrames.length - 1
            break
          default:
            this._frameIndex = 0
            break
        }

        this._canvas.width = this._loadedFrames[0].dims.width
        this._canvas.height = this._loadedFrames[0].dims.height

        this._gifCanvas.width = this._canvas.width
        this._gifCanvas.height = this._canvas.height

        this._canvasSize = 'gif';
    }

    _drawPatch(frame) {
        let dims = frame.dims;

        if (
            !this._frameImageData ||
            dims.width != this._frameImageData.width ||
            dims.height != this._frameImageData.height
        ) {
            this._tempCanvas.width = dims.width;
            this._tempCanvas.height = dims.height;
            this._frameImageData = this._tempCtx.createImageData(dims.width, dims.height);
        }

        // set the patch data as an override
        this._frameImageData.data.set(frame.patch);

        // draw the patch back over the canvas
        this._tempCtx.putImageData(this._frameImageData, 0, 0);

        this._gifCtx.drawImage(this._tempCanvas, dims.left, dims.top);
    }

    _manipulate() {
        let imageData = this._gifCtx.getImageData(0, 0, this._gifCanvas.width, this._gifCanvas.height);
        let other = this._gifCtx.createImageData(this._gifCanvas.width, this._gifCanvas.height);

        let pixelPercent = 100;;
        let pixelsX = 5 + Math.floor((pixelPercent / 100) * (this._canvas.width - 5));
        let pixelsY = (pixelsX * this._canvas.height) / this._canvas.width;

        this._ctx.putImageData(imageData, 0, 0);
        this._ctx.drawImage(this._canvas, 0, 0, this._canvas.width, this._canvas.height, 0, 0, pixelsX, pixelsY);
        this._ctx.drawImage(this._canvas, 0, 0, pixelsX, pixelsY, 0, 0, this._canvas.width, this._canvas.height);

    }

    renderFrame(frameIndex = undefined) {
        if (frameIndex !== undefined) this._frameIndex = frameIndex;
        let frame = this._loadedFrames[this._frameIndex];
        let start = new Date().getTime();

        if (this._needsDisposal) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._needsDisposal = false;
        }

        this._drawPatch(frame);

        this._manipulate();

        this.shadowRoot.querySelector('.media-controls-current-frame-display').innerText = `${this._frameIndex} / ${this._loadedFrames.length - 1}`;
        this.shadowRoot.querySelector('.media-controls-progress-panel').style.setProperty('--p-play', `${(this._frameIndex + 1) / this._loadedFrames.length * 100}%`);

        if (frame.disposalType === 2) {
            this._needsDisposal = true;
        }

        if (!this.paused) {
        switch (this.playbackMode) {
            case 'reverse':
                this._frameIndex--;
                if (this._frameIndex < 0)
                    this._frameIndex = this._loadedFrames.length - 1;
                break;
            case 'bounce':
                if (this._bounceCount) {
                    this._frameIndex--;
                    if (this._frameIndex < 0) {
                        this._frameIndex = 1;
                        this._bounceCount = 0;
                    }
                  } else {
                    this._frameIndex++;
                    if (this._frameIndex >= this._loadedFrames.length) {
                        this._frameIndex = this._loadedFrames.length - 2;
                        this._bounceCount = 1;
                    }
                  }
                  break;
            default:
                this._frameIndex++;
                if (this._frameIndex >= this._loadedFrames.length) {
                    this._frameIndex = 0;
                }
                break;
        }

        let end = new Date().getTime();
        let diff = end - start;

            let that = this;
            this._timeoutID = setTimeout(() => {
                requestAnimationFrame(() => {
                    that.renderFrame();
                });
            }, Math.max(0, Math.floor((frame.delay - diff) / this.playbackRate)));
        }
    }

    play() {
        this.paused = false;

        if (this._canvasSize !== 'gif') this.renderGIF();
        this.renderFrame();

        this.shadowRoot.querySelector('.play-pause').classList.add('pause');
        this.shadowRoot.querySelector('.play-pause').classList.remove('play');
        this.shadowRoot.querySelector('.media-controls-enclosure').classList.remove('show');
    }

    pause() {
        this.paused = true;
        this.shadowRoot.querySelector('.play-pause').classList.add('play');
        this.shadowRoot.querySelector('.play-pause').classList.remove('pause');
        this.shadowRoot.querySelector('.media-controls-enclosure').classList.add('show');
    }
});

let config = {
    autoplay: document.querySelector('#gif-click-load-off')?.classList.contains('switch-current')
};

let imgElList;

if (config.autoplay) {
    imgElList = document.querySelectorAll('img[src$=".gif"]');
} else {
    imgElList = document.querySelectorAll('img[org_src]');
}

// console.log(`为 ${imgElList.length} 个 GIF 图片添加了播放器`);

imgElList.forEach((img) => {
    let poster = img.getAttribute('src');
    let src    = img.getAttribute('org_src') || img.getAttribute('src');

    poster = poster.replace('moyu.im', 'sinaimg.cn');
    src = src.replace('moyu.im', 'sinaimg.cn');

    let player = document.createElement('cherry-gif');
    config.autoplay ? player.setAttribute('autoplay') : player.setAttribute('preload', 'none');
    player.setAttribute('poster', poster);
    player.setAttribute('crossorigin', '');
    let source = document.createElement('source');
    source.setAttribute('src', src);
    player.appendChild(source);

    img.insertAdjacentElement('beforebegin', player);
    img.hidden = true;
    img.style.display = 'none !important';
});
