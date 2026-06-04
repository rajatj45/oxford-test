'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const Breadcrumb = ({ homeElement = 'Home', capitalizeLinks = true }) => {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(path => path)

    return (
        <div className='container'>
            <ul className="flex ml-0 list-none p-0">
                <li className="flex items-center">
                    <Link href="/">{homeElement}</Link>
                </li>

                {pathSegments.length > 0 && <li className="mx-2">{' / '}</li>}

                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`
                    const isLast = index === pathSegments.length - 1

                    let label = segment.replace(/-/g, ' ')
                    if (capitalizeLinks) {
                        label = label.charAt(0).toUpperCase() + label.slice(1)
                    }

                    return (
                        <React.Fragment key={href}>
                            <li className="flex items-center">
                                {isLast ? (
                                    <span className="font-bold text-(--dark-heading)">{label}</span>
                                ) : (
                                    <Link href={href}>{label}</Link>
                                )}
                            </li>
                            {!isLast && <span className="mx-2">{' / '}</span>}
                        </React.Fragment>
                    )
                })}
            </ul>
        </div>
    )
}

export default Breadcrumb
