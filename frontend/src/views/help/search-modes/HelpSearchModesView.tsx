import React from 'react'
import './helpSearchModesView.css'
import {useNavigate} from "react-router";

export default function HelpSearchModesView() {
    const navigate = useNavigate()

    return (
        <div className="help-container">
            <div className="back-button-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back
                </button>
            </div>
            <h2 className="help-title">Understanding Search Modes</h2>

            <p className="help-intro">
                Our inventory system offers different search modes to help you find items more effectively.
                Each mode works differently and is useful for specific types of searches.
            </p>

            {/* Regular Search Mode */}
            <div className="search-mode-card">
                <div className="search-mode-header">
                    <div className="search-icon">🔍</div>
                    <h3>Regular Search</h3>
                </div>

                <div className="search-mode-content">
                    <div className="description-section">
                        <p>
                            Regular search allows you to search within a specific field. You select one field and enter
                            your search term to find exact matches.
                        </p>
                        <p>
                            Available fields include: AU Inventory Number, Brand, Name, Keywords, Location, Model,
                            Notes, Part Number, Record Number, Serial Number, and Vendor.
                        </p>
                    </div>

                    <div className="examples-section">
                        <h4>Examples:</h4>
                        <ul>
                            <li>Searching for "Dell" in the "Brand" field will find only Dell products</li>
                            <li>Searching for "A12345" in the "Serial Number" field will find the exact item with that serial number</li>
                        </ul>
                    </div>
                </div>

                <div className="best-for-section">
                    <span className="info-icon">ℹ️</span>
                    <span><strong>Best for:</strong> When you know exactly which field contains your information</span>
                </div>
            </div>

            {/* Full Text Search Mode */}
            <div className="search-mode-card">
                <div className="search-mode-header">
                    <div className="search-icon">🔍</div>
                    <h3>Full Text Search</h3>
                </div>

                <div className="search-mode-content">
                    <div className="description-section">
                        <p>
                            Full Text search looks across multiple fields at once, making it easier to find items when
                            you're not sure which field contains your information.
                        </p>
                        <p>
                            This mode searches across Name, Keywords, Brand, Model, and Vendor fields simultaneously.
                        </p>
                    </div>

                    <div className="examples-section">
                        <h4>Examples:</h4>
                        <ul>
                            <li>Searching for "projector" will find items with "projector" in any of the searchable fields</li>
                            <li>Searching for "wireless keyboard" will find items containing both words in any order</li>
                        </ul>
                    </div>
                </div>

                <div className="best-for-section">
                    <span className="info-icon">ℹ️</span>
                    <span><strong>Best for:</strong> General searches when you're not sure which field contains your information</span>
                </div>
            </div>

            {/* Full Text with Query Expansion */}
            <div className="search-mode-card">
                <div className="search-mode-header">
                    <div className="search-icon">🔍</div>
                    <h3>Full Text with Query Expansion</h3>
                </div>

                <div className="search-mode-content">
                    <div className="description-section">
                        <p>
                            This mode works like Full Text search but automatically includes similar or related terms.
                            It's like having the system guess what else you might be looking for.
                        </p>
                        <p>
                            For example, if you search for "laptop," the system might also look for "notebook" or "computer."
                        </p>
                    </div>

                    <div className="examples-section">
                        <h4>Examples:</h4>
                        <ul>
                            <li>Searching for "phone" might also find "smartphone" or "mobile"</li>
                            <li>Searching for "monitor" might also find "display" or "screen"</li>
                        </ul>
                    </div>
                </div>

                <div className="best-for-section">
                    <span className="info-icon">ℹ️</span>
                    <span><strong>Best for:</strong> When you want to find more items and don't mind some less precise matches</span>
                </div>
            </div>

            {/* Boolean Search Mode */}
            <div className="search-mode-card">
                <div className="search-mode-header">
                    <div className="search-icon">🔍</div>
                    <h3>Boolean Search</h3>
                </div>

                <div className="search-mode-content">
                    <div className="description-section">
                        <p>
                            Boolean search allows you to create more complex searches using AND, OR, and NOT operators.
                            This gives you precise control over your search results.
                        </p>
                        <p>
                            You can combine terms and specify exactly what you want to include or exclude from your search.
                        </p>
                    </div>

                    <div className="examples-section">
                        <h4>Examples:</h4>
                        <ul>
                            <li>"projector AND wireless" finds items that contain both words</li>
                            <li>"laptop OR notebook" finds items with either term</li>
                            <li>"printer NOT inkjet" finds printers but excludes inkjet models</li>
                        </ul>
                    </div>
                </div>

                <div className="best-for-section">
                    <span className="info-icon">ℹ️</span>
                    <span><strong>Best for:</strong> Advanced searches when you need very specific results</span>
                </div>
            </div>

            {/* Tips Section */}
            <div className="tips-card">
                <h3>Quick Tips for Searching</h3>
                <ul className="tips-list">
                    <li>Start with Full Text search for general queries</li>
                    <li>Use Regular search when you know exactly which field to look in</li>
                    <li>Try Full Text with Query Expansion when you need more results</li>
                    <li>Use Boolean search for complex or very specific requirements</li>
                </ul>
            </div>
        </div>
    )
}