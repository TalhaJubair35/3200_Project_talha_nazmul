import React from 'react'
import InputField from '../components/InputField'

const Location = ({ handleChange }) => {
    return (
        <div>
            <h4 className="mb-2 text-lg font-medium">Location</h4>

            <div className="">
                <label className='sidebar-label-container'>
                    <input
                        type="radio"
                        id="test"
                        name="test"
                        // placeholder="placeholder"
                        value=""
                        onChange={handleChange}
                    />
                    <span className="checkmark"></span>All
                </label>

                <InputField handleChange={handleChange} value="Dhaka" title="Dhaka" name="test" />
                <InputField handleChange={handleChange} value="Chattogram" title="Chattogram" name="test" />
                <InputField handleChange={handleChange} value="Khulna" title="Khulna" name="test" />
                <InputField handleChange={handleChange} value="Sylhet" title="Sylhet" name="test" />
                <InputField handleChange={handleChange} value="Rajshahi" title="Rajshahi" name="test" />
                <InputField handleChange={handleChange} value="Barishal" title="Barishal" name="test" />
            </div>
        </div>
    )
}

export default Location