exports.completePackage = function (package, environments) {
	package.vendors = package.vendors || {};

	for (const vendor in package.vendors) {
		package.vendors[vendor][environments[0]] = package.vendors[vendor][environments[0]] || {};

		for (let index = 1, length = environments.length; index < length; index++) {
			const currEnvironment = environments[index];
			const prevEnvironment = environments[index - 1];

			package.vendors[vendor][currEnvironment] = package.vendors[vendor][currEnvironment] || {};

			for (const key in package.vendors[vendor][prevEnvironment]) {
				if (package.vendors[vendor][currEnvironment][key] == null) {
					package.vendors[vendor][currEnvironment][key] = package.vendors[vendor][prevEnvironment][key];
				}
			}
		}
	}

	package.preprocess = package.preprocess || {};
	package.preprocess[environments[0]] = package.preprocess[environments[0]] || {};

	for (let index = 0, length = environments.length; index < length; index++) {
		const currEnvironment = environments[index];

		package.preprocess[currEnvironment] = package.preprocess[currEnvironment] || {};

		for (const vendor in package.vendors) {
			if (package.vendors[vendor][currEnvironment] != null && package.vendors[vendor][currEnvironment].preprocess != null) {
				for (const key in package.vendors[vendor][currEnvironment].preprocess) {
					if (package.preprocess[currEnvironment][key] == null) {
						package.preprocess[currEnvironment][key] = package.vendors[vendor][currEnvironment].preprocess[key];
					}
				}
			}
		}

		if (index > 0) {
			const prevEnvironment = environments[index - 1];

			for (const key in package.preprocess[prevEnvironment]) {
				if (package.preprocess[currEnvironment][key] == null) {
					package.preprocess[currEnvironment][key] = package.preprocess[prevEnvironment][key];
				}
			}
		}
	}

	return package;
}
