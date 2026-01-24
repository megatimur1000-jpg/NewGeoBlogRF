type BlogDraftSelection = {
	markers: Set<string>;
	routes: Set<string>;
	events: Set<string>;
};

type Listener = (state: Readonly<BlogDraftSelection>) => void;

class BlogDraftBus {
	private state: BlogDraftSelection = {
		markers: new Set<string>(),
		routes: new Set<string>(),
		events: new Set<string>()
	};
	private listeners: Set<Listener> = new Set();

	subscribe(listener: Listener) {
		this.listeners.add(listener);
		listener(this.getSnapshot());
		return () => this.listeners.delete(listener);
	}

	private emit() {
		const snapshot = this.getSnapshot();
		this.listeners.forEach(l => l(snapshot));
	}

	getSnapshot(): Readonly<BlogDraftSelection> {
		return {
			markers: new Set(this.state.markers),
			routes: new Set(this.state.routes),
			events: new Set(this.state.events)
		};
	}

	isSelected(kind: 'marker'|'route'|'event', id: string) {
		const map = this.getSet(kind);
		return map.has(id);
	}

	toggle(kind: 'marker'|'route'|'event', id: string) {
		const set = this.getSet(kind);
		if (set.has(id)) set.delete(id); else set.add(id);
		this.emit();
	}

	clear() {
		this.state.markers.clear();
		this.state.routes.clear();
		this.state.events.clear();
		this.emit();
	}

	private getSet(kind: 'marker'|'route'|'event') {
		if (kind === 'marker') return this.state.markers;
		if (kind === 'route') return this.state.routes;
		return this.state.events;
	}
}

export const blogDraftBus = new BlogDraftBus();




