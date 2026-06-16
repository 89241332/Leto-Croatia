import { useState } from "react"
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [role, setRole] = useState(null)
    const navigate = useNavigate()

    const handleContinue = () => {
        if (!role) return
        if (role === 'employee') navigate('/register/employee')
        if (role === 'employer') navigate('/register/employer')
    }

    return (
        
    )
}