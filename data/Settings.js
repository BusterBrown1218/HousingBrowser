import { @Vigilant @SliderProperty @SwitchProperty @NumberProperty @TextProperty @ButtonProperty @SliderProperty @CheckboxProperty } from 'Vigilance';
const metadata = FileLib.read("HousingBrowser", "metadata.json");
const version = JSON.parse(metadata).version;
@Vigilant("HousingBrowser", `§3HousingBrowser §f${version}`, {
	getCategoryComparator: () => (a, b) => {
		const categories = ["General", "Bookmarking"];

		return categories.indexOf(a.name) - categories.indexOf(b.name);
	},
})
class Settings {

	@SwitchProperty({
		name: "Automatic House Checking",
		description: 'Will automatically update the name of bookmarked housings, as well as keep track of House history for the Visited Housing category.',
		category: "General",
		subcategory: "General"
	})
	autoCheckBookmarks = true;
	
	constructor() {
		this.initialize(this);
	}
}

export default new Settings();