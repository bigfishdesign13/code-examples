const data = () => {
   fetch("data/prototype.json").then(response => {
      return response.json();
   }).then(data => parseData(data));
}

const parseData = d => {
    const ctas = d.CTAs;
    ctas.forEach(function(cta) {
        let c = new CTA(cta)
    });
}

class CTA {
    constructor(...props) {
        this.title = props[0].title;
        this.blurb = props[0].blurb;
        this.icon = props[0].icon;

        this.updatePage();
    }

    updatePage() {
        console.log(this.title + ' :: ' + this.icon + ' :: ' + this.blurb);

        let row = document.getElementById('cta-house');

        let pod = document.createElement('div');
        pod.className = 'pod';
        row.appendChild(pod);

        let interior = document.createElement('div');
        interior.className = 'interior cta center allow-actions grow';
        pod.appendChild(interior);

        let icn = document.createElement('span');
        icn.className = 'icn ' + this.icon;
        interior.appendChild(icn);

        let title = document.createElement('h2');
        // title.className = 'icn ' + this.icon;
        title.innerHTML = this.title;
        interior.appendChild(title);

        let blurb = document.createElement('p');
        // blurb.className = 'icn ' + this.icon;
        blurb.innerHTML = this.blurb;
        interior.appendChild(blurb);

        let buttons = document.createElement('div');
        buttons.className = 'buttons';
        interior.appendChild(buttons);

        let button1 = document.createElement('button');
        // blurb.className = 'icn ' + this.icon;
        button1.innerHTML = 'VIEW LIBRARY';
        buttons.appendChild(button1);

        let button2 = document.createElement('button');
        button2.className = 'transparent';
        button2.innerHTML = 'Latest Releases';
        buttons.appendChild(button2);
    }
}

data();