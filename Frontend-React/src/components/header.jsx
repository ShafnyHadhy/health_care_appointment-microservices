export default function Header() {
    return (
        <div className="w-full h-16 bg-primary text-white flex flex-row items-center justify-between px-10">
            
            <h1 className="text-2xl font-bold">Name</h1>

            <div className="flex flex-row gap-5">
                <a href="/" className="text-white hover:text-accent">Home</a>
                <a href="/products" className="text-white hover:text-accent">Products</a>
                <a href="/about" className="text-white hover:text-accent">About</a>
                <a href="/contact" className="text-white hover:text-accent">Contact</a>
            </div>

            <div>
                <a href="/login" className="text-white hover:text-primary px-4 py-2 rounded-md bg-secondary hover:bg-accent transition-colors duration-200">Login</a>
            </div>
        </div>
    )
}