import { useState } from 'react';
import axios from 'axios'

const images = require.context('./Dataset', true);

function ImageElement({imagepath, checked, handleClick}) {
    const imagedata = images(`./${imagepath}`);


    return (
        <div class="col-md-3">
            <div class="custom-control custom-checkbox image-checkbox">
            <input type="checkbox" class="custom-control-input" id={imagepath} checked={checked} onClick={handleClick}/>
            <label class="custom-control-label" for={imagepath}>
                <img src={imagedata} alt="#" class="img-thumbnail" style={{width: "200px", height: "200px"}}/>
            </label>
            </div>
            
        </div>
    );
}

function ImageContainer({datasetlist, onChange}){ //Image container load
    //Save all the data into one list
    const imgdatals = datasetlist.filepaths.map((imgpath, index) => ({imagepath: {imgpath}, checked: false, indexing: {index}}));
    const [imgdata, setImgdata] = useState(imgdatals);
    const [allcheck, setAllCheck] = useState(true);
    
    function handleClick(i) {
        const cloneimgdata = imgdata.slice();
        cloneimgdata[i].checked = !cloneimgdata[i].checked;
        setImgdata(cloneimgdata);

        onChange(cloneimgdata);
    }

    function handleAllClick() {
        let cloneimgdata = imgdata.slice();
        setAllCheck(!allcheck);
        cloneimgdata = cloneimgdata.map((imgobj) => {
            let imgobjclone = imgobj;
            imgobjclone.checked = allcheck;
            return imgobjclone;
        });
        setImgdata(cloneimgdata);

        onChange(cloneimgdata);
    }

    const imgList = imgdata.map((imgobj) => (<ImageElement imagepath={imgobj.imagepath.imgpath} checked={imgobj.checked} handleClick={() => handleClick(imgobj.indexing.index)}/>));
    return (
        <div class="container my-2">
            <div class="imageContainer border mx-auto">
                <div class="datasetName my-2 mx-3 d-inline-block">{datasetlist.dataset}</div>
                <input type="checkbox" class="d-inline-block" onClick={handleAllClick}/>
                <div class="imgList container overflow-auto">
                    <div class="row">
                        {imgList}
                    </div>

                </div>
            </div>
        </div>
    );
}

function ResultComponent( {data, ConChange} ){ //All result component
    const containerList = data.map((dataset, index) => (<ImageContainer datasetlist={dataset} onChange={(newdata) => onConChange({index}, newdata)}/>));
    const [conlist, setConlist] = useState([Array(data.length).fill(null)]);
    
    function onConChange(i, newdata) {
        let conlist_clone = conlist.slice();
        conlist_clone[i.index] = newdata;
        setConlist(conlist_clone); 

        ConChange(conlist);
    }
    
    return (<div>{containerList}</div>);
}


export default function SearchEngine(){
    const [respdata, setRespdata] = useState([]);
    const [conlist, setConlist] = useState([]);

    async function fetchData() {
        var searchinput = document.getElementById("searchtext");
        const resp = await axios.get("http://localhost:5000/get_data", {
                params: {
                    "query": searchinput.value
                },
                headers: {
                },
            });
        
        setRespdata(resp.data);
    }

    function changeConList(newcon) {
        setConlist(newcon);
        console.log(conlist);
    }

    async function fetchDownload() {
        let checkedlist = conlist.flat().filter((imgobj) => imgobj.checked);
        let imglist = checkedlist.map((imgobj) => imgobj.imagepath.imgpath);
        console.log(imglist);

        const resp = await axios.post("http://localhost:5000/download", {
            "imglist": imglist
        });
        alert("Downloaded: " + resp.data["url"]);
    }

    return (
        <>
        
        <div class="container mx-auto my-3">
            <div class="mx-auto text-center">
                <input id="searchtext" placeholder='Photos containing animals, 128x128' style={{width: "50%"}}></input>
                <button class="searchbtn" onClick={fetchData}>Search</button>
            </div>
        </div>

        <div>
            <ResultComponent data={respdata} ConChange={changeConList}/>
        </div>


        <div class="text-center m-3">
            <button type="button" class="btn btn-primary" onClick={fetchDownload}>Download</button>
        </div>
        </>
    );
}
