"""
Optimized service offerings seed data with standardized naming conventions
"""

services = [
    {
        "service_id": "SRV-SEC-001",
        "name": "Surveillance & Security System Installation",
        "description": "Professional setup of CCTV cameras, alarm systems, and remote monitoring solutions for residential and commercial properties. Includes system configuration, testing, and user training.",
        "category": "Security Systems",
        "subcategory": "Installation",
        "base_price": 5000.00,
        "price_type": "starting_from",  # starting_from, fixed, per_hour
        "duration_estimate": "4-8 hours",
        "features": [
            "CCTV camera installation",
            "Alarm system setup",
            "Remote monitoring configuration",
            "Mobile app integration",
            "System testing and calibration",
            "User training included"
        ],
        "requirements": [
            "Site survey required",
            "Power outlets availability",
            "Internet connection for remote monitoring"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-TV-001",
        "name": "TV Wall Mounting Service",
        "description": "Professional TV wall mounting service for all TV sizes up to 85 inches. Includes bracket installation, cable management, and alignment.",
        "category": "Entertainment Systems",
        "subcategory": "Installation",
        "base_price": 1500.00,
        "price_type": "starting_from",
        "duration_estimate": "1-2 hours",
        "features": [
            "Secure wall mounting",
            "Cable management and concealment",
            "Level alignment and positioning",
            "Bracket and hardware included",
            "Post-installation cleanup"
        ],
        "requirements": [
            "Wall type identification required",
            "TV size and weight specifications",
            "Mounting location accessibility"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-COMP-001",
        "name": "Computer & Laptop Repair",
        "description": "Comprehensive diagnostic and repair service for desktop computers and laptops. Covers hardware issues, software problems, virus removal, and performance optimization.",
        "category": "Computer Services",
        "subcategory": "Repair",
        "base_price": 1000.00,
        "price_type": "starting_from",
        "duration_estimate": "2-48 hours",
        "features": [
            "Complete diagnostic testing",
            "Hardware component repair/replacement",
            "Operating system troubleshooting",
            "Virus and malware removal",
            "Performance optimization",
            "Data backup and recovery"
        ],
        "requirements": [
            "Device drop-off or on-site service available",
            "Backup important data before service"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "repair"
    },
    {
        "service_id": "SRV-NET-001",
        "name": "Home & Office Network Setup",
        "description": "Professional network installation and configuration for homes and offices. Includes router setup, WiFi optimization, network security, and multi-device connectivity.",
        "category": "Networking",
        "subcategory": "Installation",
        "base_price": 2500.00,
        "price_type": "starting_from",
        "duration_estimate": "2-4 hours",
        "features": [
            "Router installation and configuration",
            "WiFi network optimization",
            "Network security setup",
            "Multiple access point installation",
            "Device connectivity setup",
            "Network testing and documentation"
        ],
        "requirements": [
            "Internet service provider details",
            "Building layout for coverage planning",
            "Power outlets for network equipment"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-HT-001",
        "name": "Home Theater System Installation",
        "description": "Complete home theater setup including TV, sound system, streaming devices, and smart home integration. Professional calibration for optimal audio-visual experience.",
        "category": "Entertainment Systems",
        "subcategory": "Installation",
        "base_price": 8000.00,
        "price_type": "starting_from",
        "duration_estimate": "4-6 hours",
        "features": [
            "TV and display setup",
            "Surround sound system installation",
            "Streaming device configuration",
            "Universal remote programming",
            "Smart home integration",
            "Audio-visual calibration"
        ],
        "requirements": [
            "Room dimensions and layout",
            "Equipment list and specifications",
            "Power and cable routing plan"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-SOLAR-001",
        "name": "Solar Power System Installation",
        "description": "Complete solar power system design and installation for homes and businesses. Includes solar panels, inverters, battery backup, and grid connection.",
        "category": "Solar & Energy",
        "subcategory": "Installation",
        "base_price": 150000.00,
        "price_type": "starting_from",
        "duration_estimate": "2-5 days",
        "features": [
            "Site assessment and system design",
            "Solar panel installation",
            "Inverter and battery setup",
            "Grid connection and metering",
            "System monitoring setup",
            "Warranty and maintenance plan"
        ],
        "requirements": [
            "Roof condition assessment",
            "Electrical system evaluation",
            "Local permits and approvals",
            "Power consumption analysis"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-PHONE-001",
        "name": "Mobile Phone Screen Repair",
        "description": "Professional screen replacement service for all major smartphone brands. Quick turnaround with genuine or high-quality replacement parts.",
        "category": "Mobile Services",
        "subcategory": "Repair",
        "base_price": 2000.00,
        "price_type": "starting_from",
        "duration_estimate": "1-2 hours",
        "features": [
            "Genuine or premium replacement screens",
            "Touch and display testing",
            "Device cleaning and inspection",
            "Waterproof seal replacement",
            "90-day warranty on repairs"
        ],
        "requirements": [
            "Phone model and specifications",
            "Backup data before service",
            "Remove phone case and screen protector"
        ],
        "is_active": True,
        "featured": False,
        "service_type": "repair"
    },
    {
        "service_id": "SRV-DATA-001",
        "name": "Data Recovery Service",
        "description": "Professional data recovery from failed hard drives, SSDs, memory cards, and other storage devices. No data, no charge policy.",
        "category": "Computer Services",
        "subcategory": "Recovery",
        "base_price": 3000.00,
        "price_type": "starting_from",
        "duration_estimate": "1-7 days",
        "features": [
            "Free diagnostic evaluation",
            "Recovery from all storage types",
            "Secure data handling",
            "Data verification and delivery",
            "No recovery, no fee guarantee"
        ],
        "requirements": [
            "Storage device specifications",
            "Description of data loss incident",
            "List of critical files to recover"
        ],
        "is_active": True,
        "featured": False,
        "service_type": "recovery"
    },
    {
        "service_id": "SRV-SMART-001",
        "name": "Smart Home Automation Setup",
        "description": "Transform your home with smart automation. Includes smart lighting, climate control, security integration, and voice assistant setup.",
        "category": "Smart Home",
        "subcategory": "Installation",
        "base_price": 10000.00,
        "price_type": "starting_from",
        "duration_estimate": "4-8 hours",
        "features": [
            "Smart lighting installation",
            "Climate control integration",
            "Security system connectivity",
            "Voice assistant setup (Alexa/Google)",
            "Automation routine programming",
            "Mobile app configuration"
        ],
        "requirements": [
            "WiFi network availability",
            "Compatible devices list",
            "Home layout and automation goals"
        ],
        "is_active": True,
        "featured": True,
        "service_type": "installation"
    },
    {
        "service_id": "SRV-MAINT-001",
        "name": "IT Equipment Maintenance Package",
        "description": "Comprehensive maintenance package for computers, networks, and office equipment. Includes regular checkups, software updates, and priority support.",
        "category": "Computer Services",
        "subcategory": "Maintenance",
        "base_price": 5000.00,
        "price_type": "per_month",
        "duration_estimate": "Monthly visits",
        "features": [
            "Monthly system checkups",
            "Software updates and patches",
            "Performance optimization",
            "Hardware cleaning and inspection",
            "Priority technical support",
            "Quarterly comprehensive reports"
        ],
        "requirements": [
            "Equipment inventory list",
            "Service schedule preferences",
            "Remote access permissions"
        ],
        "is_active": True,
        "featured": False,
        "service_type": "maintenance"
    }
]
