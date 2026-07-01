from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
import json


def main():
    print('DEBUG: start', flush=True)
    options = Options()
    options.use_chromium = True
    options.binary_location = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
    options.add_argument('--headless=new')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

    print('DEBUG: creating edge driver', flush=True)
    driver = webdriver.Edge(options=options)
    try:
        print('DEBUG: driver created', flush=True)
        driver.set_page_load_timeout(30)
        print('DEBUG: loading page', flush=True)
        driver.get('http://127.0.0.1:8080/#/')
        print('DEBUG: page requested', flush=True)
        WebDriverWait(driver, 10).until(
            lambda current: current.execute_script('return document.readyState') == 'complete'
        )
        print('DEBUG: page ready', flush=True)

        body_text = driver.execute_script('return document.body ? document.body.innerText : ""')
        app_html = driver.execute_script(
            'var el=document.getElementById("app"); return el ? el.innerHTML.slice(0, 4000) : "<no-app>"'
        )
        logs = driver.get_log('browser')

        print('BODY_TEXT_START')
        print(body_text[:2000])
        print('BODY_TEXT_END')
        print('APP_HTML_START')
        print(app_html)
        print('APP_HTML_END')
        print('BROWSER_LOGS_START')
        print(json.dumps(logs, ensure_ascii=False, indent=2))
        print('BROWSER_LOGS_END')
    finally:
        print('DEBUG: quitting driver', flush=True)
        driver.quit()


if __name__ == '__main__':
    main()