import "./Logo.scss"
import React, {useEffect, useState} from 'react'
import {useUtils} from "/src/hooks/utils.js"

function Logo({ className = "", style = {}, size, setDidLoad, imageSrc = "images/logo.png" }) {
    const utils = useUtils()

    className = className || ``
    size = utils.number.forceIntoBounds(size, 0, 3, 3)

    const sizeClass = `logo-wrapper-size-${size}`

    return (
        <div className={`logo-wrapper ${sizeClass} ${className}`}
             style={style}>
            <img src={utils.file.resolvePath(imageSrc)}
                 onLoad={() => { setDidLoad && setDidLoad(true) }}
                 alt="Blackpool Industry"/>
        </div>
    )
}

export default Logo